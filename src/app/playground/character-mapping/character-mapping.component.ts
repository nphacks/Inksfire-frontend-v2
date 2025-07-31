import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { ProjectDataService } from '../services/project-data.service';
import { Subscription } from 'rxjs';
import cytoscape from 'cytoscape';

interface Character {
  name: string;
  description?: string;
  notes?: string;
  actors?: any[];
}

interface StoryBeat {
  title?: string;
  name?: string;
  content?: string;
  description?: string;
}

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
  private cy: any;

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
    // Only initialize when map tab is active
    if (this.activeTab === 'map' && this.characterMap.length > 0) {
      setTimeout(() => this.initializeCytoscapeChart(), 100);
    }
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
        setTimeout(() => this.initializeCytoscapeChart(), 100);
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
    
    // Only initialize Cytoscape when switching to map tab and data exists
    if (tab === 'map' && this.characterMap.length > 0) {
      setTimeout(() => this.initializeCytoscapeChart(), 100);
    } else if (tab !== 'map' && this.cy) {
      // Destroy Cytoscape when leaving map tab to free memory
      this.cy.destroy();
      this.cy = null;
    }
  }

  onHistoryTypeChange() {
    // Update edge labels when history type changes  
    if (this.cy) {
      this.updateCytoscapeLabels();
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

  initializeCytoscapeChart() {
    if (!this.d3Container?.nativeElement || this.characterMap.length === 0) {
      console.log('Cytoscape container not ready');
      return;
    }
    
    // Clear any existing chart
    if (this.cy) {
      this.cy.destroy();
      this.cy = null;
    }
    
    // Prepare elements for Cytoscape
    const elements = this.prepareCytoscapeElements();

    if (Array.isArray(elements) && elements.length === 0) {
      console.log('No character data available');
      return;
    }
    
    // Initialize Cytoscape
    this.cy = cytoscape({
      container: this.d3Container.nativeElement,
      elements: elements,
      style: [
        {
          selector: 'node',
          style: {
            'background-color': '#6366f1',
            'label': 'data(label)',
            'text-valign': 'center',
            'text-halign': 'center',
            'color': 'white',
            'font-size': '12px',
            'font-weight': 'bold',
            'width': '80px',
            'height': '80px',
            'border-width': '3px',
            'border-color': '#fff'
          }
        },
        {
          selector: 'edge',
          style: {
            'width': 2,
            'line-color': 'data(color)',
            'target-arrow-color': 'data(color)',
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier',
            'label': 'data(label)',
            'font-size': '11px',
            'text-rotation': 'none',
            'text-margin-y': -15,
            'text-background-color': 'white',
            'text-background-opacity': 0.8,
            'text-background-padding': '3px',
            'text-border-color': '#e0e0e0',
            'text-border-width': 1,
            'text-border-opacity': 0.5,
            'text-wrap': 'wrap',
            'text-max-width': '80px'
          }
        }
      ],
      layout: {
        name: 'cose',
        idealEdgeLength: 150,
        nodeOverlap: 20,
        refresh: 20,
        fit: true,
        padding: 30,
        randomize: false,
        componentSpacing: 100,
        nodeRepulsion: 400000,
        edgeElasticity: 100,
        nestingFactor: 5,
        gravity: 80,
        numIter: 1000,
        initialTemp: 200,
        coolingFactor: 0.95,
        minTemp: 1.0
      }
    });
  }
  
  prepareCytoscapeElements() {
    const elements: any[] = [];
    
    // Add character nodes
    this.characterList.forEach(char => {
      elements.push({
        data: {
          id: char.name,
          label: char.name.length > 10 ? char.name.substring(0, 10) + '...' : char.name
        }
      });
    });
    
    // Add relationship edges if they exist
    this.characterMap.forEach(rel => {
      elements.push({
        data: {
          id: `${rel.source}-${rel.target}`,
          source: rel.source,
          target: rel.target,
          label: this.getEdgeLabelText({ relationship: rel }),
          color: this.getRelationshipColor({ relationship: rel })
        }
      });
    });
    
    // If no relationships but we have characters, just show characters
    if (this.characterMap.length === 0 && this.characterList.length > 0) {
      return {
        nodes: elements.filter(el => !el.data.source),
        edges: []
      };
    }
    
    return elements;
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

  updateCytoscapeLabels() {
    if (!this.cy) return;
    
    // Update edge labels based on selected history type
    this.cy.edges().forEach((edge: any) => {
      const rel = this.characterMap.find(r => 
        `${r.source}-${r.target}` === edge.id()
      );
      if (rel) {
        edge.data('label', this.getEdgeLabelText({ relationship: rel }));
      }
    });
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
    
    // Properly destroy Cytoscape instance
    if (this.cy) {
      this.cy.destroy();
      this.cy = null;
    }
  }
}
