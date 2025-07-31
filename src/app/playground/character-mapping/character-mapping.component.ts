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

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
