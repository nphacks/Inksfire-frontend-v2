import { Component, OnInit } from '@angular/core';
import { ProjectDataService } from '../services/project-data.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-character-mapping',
  templateUrl: './character-mapping.component.html',
  styleUrl: './character-mapping.component.scss'
})
export class CharacterMappingComponent implements OnInit {

  constructor(private projectDataService: ProjectDataService) {}
  
  projectData: any = {};
  stories: any[] = [];
  characterList: any[] = [];
  characterMap: any[] = [];
  selectedStoryIndex: number = 0;
  selectedStory: any = null;
  activeTab: string = 'characters';
  selectedHistoryType: string = 'type';
  showActorOptions: boolean = false;
  selectedCharacter: any = null;
  selectedRelationship: any = null;
  selectedCharacterNode: string = '';
  private subs = new Subscription();

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

  onStoryChange() {
    if (this.stories.length > 0 && this.selectedStoryIndex >= 0) {
      this.selectedStory = this.stories[this.selectedStoryIndex];
      this.characterList = this.selectedStory?.character_mapping?.characters || [];
      this.characterMap = this.selectedStory?.character_mapping?.relationships || [];
      
      // Initialize notes for characters if not present
      this.characterList.forEach((character: any) => {
        if (!character.notes) {
          character.notes = '';
        }
      });
    }
  }

  onHistoryTypeChange() {
    // This method is called when the history type selector changes
    // The template will automatically update based on selectedHistoryType
  }

  saveCharacterNotes(character: any) {
    // Auto-save character notes
    console.log('Saving notes for character:', character.name, character.notes);
    // TODO: Implement API call to save character notes
  }

  openActorOptions(character: any) {
    this.selectedCharacter = character;
    this.showActorOptions = true;
  }

  closeActorOptions() {
    this.showActorOptions = false;
    this.selectedCharacter = null;
  }

  getUniqueCharacters(): string[] {
    const characters = new Set<string>();
    this.characterMap.forEach(rel => {
      characters.add(rel.source);
      characters.add(rel.target);
    });
    return Array.from(characters);
  }

  getConnectionCount(character: string): number {
    return this.characterMap.filter(rel => 
      rel.source === character || rel.target === character
    ).length;
  }

  getCharacterPosition(character: string, index: number): { x: number, y: number } {
    const containerWidth = 800; // Approximate container width
    const containerHeight = 500; // Approximate container height
    const nodeWidth = 120;
    const nodeHeight = 80;
    
    // Create a circular layout
    const totalCharacters = this.getUniqueCharacters().length;
    const angle = (index * 2 * Math.PI) / totalCharacters;
    const radius = Math.min(containerWidth, containerHeight) * 0.3;
    
    const centerX = containerWidth / 2;
    const centerY = containerHeight / 2;
    
    const x = centerX + radius * Math.cos(angle) - nodeWidth / 2;
    const y = centerY + radius * Math.sin(angle) - nodeHeight / 2;
    
    return { x: Math.max(10, Math.min(x, containerWidth - nodeWidth - 10)), 
             y: Math.max(10, Math.min(y, containerHeight - nodeHeight - 10)) };
  }

  getLineCoordinates(relationship: any): { x1: number, y1: number, x2: number, y2: number } {
    const characters = this.getUniqueCharacters();
    const sourceIndex = characters.indexOf(relationship.source);
    const targetIndex = characters.indexOf(relationship.target);
    
    const sourcePos = this.getCharacterPosition(relationship.source, sourceIndex);
    const targetPos = this.getCharacterPosition(relationship.target, targetIndex);
    
    // Calculate center points of nodes
    const x1 = sourcePos.x + 60; // Half of node width
    const y1 = sourcePos.y + 40; // Half of node height
    const x2 = targetPos.x + 60;
    const y2 = targetPos.y + 40;
    
    return { x1, y1, x2, y2 };
  }

  getRelationshipColor(relationship: any): string {
    // Color based on relationship type or default
    const historyTypes = relationship.history?.map((h: any) => h.type) || [];
    
    if (historyTypes.includes('conflict')) return '#dc3545';
    if (historyTypes.includes('romance')) return '#e91e63';
    if (historyTypes.includes('friendship')) return '#28a745';
    if (historyTypes.includes('family')) return '#fd7e14';
    
    return 'var(--color3)'; // Default color
  }

  selectCharacterNode(character: string) {
    this.selectedCharacterNode = character;
    this.selectedRelationship = null;
  }

  selectRelationship(relationship: any) {
    this.selectedRelationship = relationship;
    this.selectedCharacterNode = '';
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
