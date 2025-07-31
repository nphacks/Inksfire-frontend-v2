import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { ProjectDataService } from '../services/project-data.service';
import { Subscription } from 'rxjs';
import * as d3 from 'd3';

@Component({
  selector: 'app-character-mapping',
  templateUrl: './character-mapping.component.html',
  styleUrl: './character-mapping.component.scss'
})
export class CharacterMappingComponent implements OnInit, AfterViewInit, OnDestroy {

  constructor(private projectDataService: ProjectDataService) {}
  
  @ViewChild('d3Container', { static: false }) d3Container!: ElementRef;
  
  projectData: any = {};
  stories: any[] = [];
  characterList: any[] = [];
  characterMap: any[] = [];
  selectedStoryIndex: number = 0;
  selectedStory: any = null;
  activeTab: string = 'characters';
  selectedHistoryType: string = 'type';
  isActorOptionsVisible: boolean = false;
  isActorInfoVisible: boolean = false;
  selectedCharacter: any = null;
  selectedActor: any = null;
  actorSearchQuery: string = '';
  private subs = new Subscription();
  private svg: any;
  private simulation: any;
  private nodes: any[] = [];
  private links: any[] = [];

  ngOnInit(): void {
    this.subs.add(
      this.projectDataService.project$.subscribe({
        next: (res: any) => {
          if (res) {
            this.projectData = res;
            this.stories = res.stories || [];
            
            // Set default story selection
            if (this.stories.length > 0) {
              this.selectedStoryIndex = 0;
              this.onStoryChange();
            }
          }
        },
        error: (err) => {
          console.error(err);
        }
      })
    );
  }

  ngAfterViewInit(): void {
    // Initialize D3 chart when view is ready
    setTimeout(() => {
      if (this.activeTab === 'map') {
        this.initializeD3Chart();
      }
    }, 100);
  }

  onStoryChange() {
    if (this.stories.length > 0 && this.selectedStoryIndex >= 0) {
      this.selectedStory = this.stories[this.selectedStoryIndex];
      
      // Handle different possible data structures
      if (this.selectedStory?.character_mapping) {
        this.characterList = this.selectedStory.character_mapping.characters || [];
        this.characterMap = this.selectedStory.character_mapping.relationships || [];
      } else {
        // Fallback: extract characters from story_beats if character_mapping doesn't exist
        this.characterList = this.extractCharactersFromBeats();
        this.characterMap = [];
      }
      
      // Initialize notes for characters if not present
      this.characterList.forEach((character: any) => {
        if (!character.notes) {
          character.notes = '';
        }
      });
      
      // Reinitialize D3 chart if on map tab
      if (this.activeTab === 'map') {
        setTimeout(() => this.initializeD3Chart(), 100);
      }
    }
  }

  extractCharactersFromBeats(): any[] {
    if (!this.selectedStory?.story_beats) return [];
    
    const charactersSet = new Set<string>();
    this.selectedStory.story_beats.forEach((beat: any) => {
      if (beat.characters && Array.isArray(beat.characters)) {
        beat.characters.forEach((char: string) => charactersSet.add(char));
      }
    });
    
    return Array.from(charactersSet).map(name => ({
      name,
      description: `Character from story beats`,
      notes: '',
      actors: []
    }));
  }

  switchTab(tab: string) {
    this.activeTab = tab;
    if (tab === 'map') {
      setTimeout(() => this.initializeD3Chart(), 100);
    }
  }

  onHistoryTypeChange() {
    // Update edge labels when history type changes
    if (this.svg) {
      this.updateEdgeLabels();
    }
  }

  saveCharacterNotes(character: any) {
    // Auto-save character notes
    console.log('Saving notes for character:', character.name, character.notes);
    // TODO: Implement API call to save character notes
  }

  openActorOptions(character: any) {
    this.selectedCharacter = character;
    this.isActorOptionsVisible = true;
    this.isActorInfoVisible = false;
  }

  closeActorOptions() {
    this.isActorOptionsVisible = false;
    this.selectedCharacter = null;
    this.actorSearchQuery = '';
  }

  showActorInfoDrawer(actor: any) {
    this.selectedActor = actor;
    this.isActorInfoVisible = true;
    this.isActorOptionsVisible = false;
    console.log('Selected actor:', actor);
  }

  closeActorInfo() {
    this.isActorInfoVisible = false;
    this.selectedActor = null;
  }

  searchActors() {
    if (this.selectedCharacter && this.actorSearchQuery.trim()) {
      console.log('Character context:', this.selectedCharacter.description);
      console.log('User Search:', this.actorSearchQuery);
    }
  }

  initializeD3Chart() {
    if (!this.d3Container?.nativeElement) {
      console.log('D3 container not ready');
      return;
    }
    
    // If no character relationships, create a simple character display
    if (!this.characterMap.length && this.characterList.length > 0) {
      this.createSimpleCharacterDisplay();
      return;
    }
    
    if (!this.characterMap.length) {
      console.log('No character data available');
      return;
    }
    
    // Clear any existing chart
    d3.select(this.d3Container.nativeElement).selectAll("*").remove();
    
    const container = this.d3Container.nativeElement;
    const width = container.clientWidth;
    const height = container.clientHeight;
    
    // Create SVG
    this.svg = d3.select(container)
      .append('svg')
      .attr('width', width)
      .attr('height', height);
    
    // Create arrow marker
    this.svg.append('defs')
      .append('marker')
      .attr('id', 'arrowhead')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 15)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', '#330099');
    
    // Prepare nodes and links
    this.prepareNodesAndLinks();
    
    // Create force simulation
    this.simulation = d3.forceSimulation(this.nodes)
      .force('link', d3.forceLink(this.links).id((d: any) => d.id).distance(150))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(60));
    
    // Create links
    const link = this.svg.append('g')
      .attr('class', 'links')
      .selectAll('line')
      .data(this.links)
      .enter().append('line')
      .attr('stroke', (d: any) => this.getRelationshipColor(d))
      .attr('stroke-width', 2)
      .attr('marker-end', 'url(#arrowhead)');
    
    // Create edge labels
    const edgeLabels = this.svg.append('g')
      .attr('class', 'edge-labels')
      .selectAll('text')
      .data(this.links)
      .enter().append('text')
      .attr('class', 'edge-label')
      .attr('text-anchor', 'middle')
      .attr('font-size', '10px')
      .attr('fill', '#333')
      .attr('background', 'white')
      .text((d: any) => this.getEdgeLabelText(d));
    
    // Create nodes
    const node = this.svg.append('g')
      .attr('class', 'nodes')
      .selectAll('g')
      .data(this.nodes)
      .enter().append('g')
      .attr('class', 'node')
      .call(d3.drag()
        .on('start', (event: any, d: any) => this.dragstarted(event, d))
        .on('drag', (event: any, d: any) => this.dragged(event, d))
        .on('end', (event: any, d: any) => this.dragended(event, d)));
    
    // Add circles to nodes
    node.append('circle')
      .attr('r', 40)
      .attr('fill', '#330099')
      .attr('stroke', '#fff')
      .attr('stroke-width', 3);
    
    // Add text to nodes
    node.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '0.3em')
      .attr('font-size', '12px')
      .attr('fill', 'white')
      .attr('font-weight', 'bold')
      .text((d: any) => d.id);
    
    // Add connection count
    node.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '1.5em')
      .attr('font-size', '10px')
      .attr('fill', 'white')
      .text((d: any) => `${d.connections} connections`);
    
    // Update positions on simulation tick
    this.simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);
      
      edgeLabels
        .attr('x', (d: any) => (d.source.x + d.target.x) / 2)
        .attr('y', (d: any) => (d.source.y + d.target.y) / 2);
      
      node
        .attr('transform', (d: any) => `translate(${d.x},${d.y})`);
    });
  }
  
  createSimpleCharacterDisplay() {
    const container = this.d3Container.nativeElement;
    const width = container.clientWidth;
    const height = container.clientHeight;
    
    // Clear any existing chart
    d3.select(container).selectAll("*").remove();
    
    // Create SVG
    this.svg = d3.select(container)
      .append('svg')
      .attr('width', width)
      .attr('height', height);
    
    // Create simple circular layout for characters
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 3;
    
    const characterNodes = this.characterList.map((char, index) => {
      const angle = (index / this.characterList.length) * 2 * Math.PI;
      return {
        id: char.name,
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
        description: char.description
      };
    });
    
    // Create character nodes
    const node = this.svg.append('g')
      .attr('class', 'nodes')
      .selectAll('g')
      .data(characterNodes)
      .enter().append('g')
      .attr('class', 'node')
      .attr('transform', (d: any) => `translate(${d.x},${d.y})`);
    
    // Add circles
    node.append('circle')
      .attr('r', 40)
      .attr('fill', '#330099')
      .attr('stroke', '#fff')
      .attr('stroke-width', 3);
    
    // Add character names
    node.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '0.3em')
      .attr('font-size', '12px')
      .attr('fill', 'white')
      .attr('font-weight', 'bold')
      .text((d: any) => d.id.length > 10 ? d.id.substring(0, 10) + '...' : d.id);
  }

  prepareNodesAndLinks() {
    const characters = new Set<string>();
    this.characterMap.forEach(rel => {
      characters.add(rel.source);
      characters.add(rel.target);
    });
    
    // Create nodes
    this.nodes = Array.from(characters).map(char => ({
      id: char,
      connections: this.getConnectionCount(char)
    }));
    
    // Create links
    this.links = this.characterMap.map(rel => ({
      source: rel.source,
      target: rel.target,
      relationship: rel
    }));
  }

  getConnectionCount(character: string): number {
    return this.characterMap.filter(rel => 
      rel.source === character || rel.target === character
    ).length;
  }

  getRelationshipColor(relationship: any): string {
    const rel = relationship.relationship || relationship;
    const historyTypes = rel.history?.map((h: any) => h.type) || [];
    
    if (historyTypes.includes('conflict')) return '#dc3545';
    if (historyTypes.includes('romance')) return '#e91e63';
    if (historyTypes.includes('friendship')) return '#28a745';
    if (historyTypes.includes('family')) return '#fd7e14';
    
    return '#330099'; // Default color
  }

  getEdgeLabelText(link: any): string {
    const rel = link.relationship;
    if (!rel.history || rel.history.length === 0) return '';
    
    // Get the first history item's selected type
    const firstHistory = rel.history[0];
    switch (this.selectedHistoryType) {
      case 'type':
        return firstHistory.type || '';
      case 'step':
        return firstHistory.step || '';
      case 'notes':
        return firstHistory.notes ? firstHistory.notes.substring(0, 20) + '...' : '';
      default:
        return '';
    }
  }

  updateEdgeLabels() {
    if (!this.svg) return;
    
    this.svg.selectAll('.edge-label')
      .text((d: any) => this.getEdgeLabelText(d));
  }

  // D3 drag event handlers
  dragstarted(event: any, d: any) {
    if (!event.active) this.simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }

  dragged(event: any, d: any) {
    d.fx = event.x;
    d.fy = event.y;
  }

  dragended(event: any, d: any) {
    if (!event.active) this.simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
    if (this.simulation) {
      this.simulation.stop();
    }
  }
}
