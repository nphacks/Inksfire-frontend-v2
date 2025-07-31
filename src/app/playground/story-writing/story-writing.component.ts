import { Component, OnDestroy, OnInit } from '@angular/core';
import { ProjectDataService } from '../services/project-data.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ProjectService } from '../services/project.service';
import { TagsService } from '../services/tags.service';
import { StoryService } from '../services/story.service';
import { Subscription } from 'rxjs';
import { filter, switchMap, tap } from 'rxjs/operators';

@Component({
  selector: 'app-story-writing',
  templateUrl: './story-writing.component.html',
  styleUrl: './story-writing.component.scss'
})
export class StoryWritingComponent implements OnInit, OnDestroy {

  projectId = ''
  isProjectNew = false
  isProjectPlan = false
  projectData: any = {}
  isDrawerOpen = false;
  activeHelperTab = 'tags';
  helperTabs = [
    { id: 'demographics', name: 'Demographics', icon: 'people' },
    { id: 'ai', name: 'AI Help', icon: 'psychology' },
    { id: 'project', name: 'Project Info', icon: 'info' }
  ];
  searchedTags: { name: string; id?: string, tag_id?: string, type?: string }[] = [];
  searchedEntities = []
  searchedTagType = []
  tagSearchText = ''
  selectedTags: any[] = []
  currentTagDemographics: any = null
  Math = Math
  stories: { title: string; writing?: string,  }[] = [];
  activeStory: any;
  storyStructures = [
    'Any',
    'Three-Act Structure',
    'The Hero\'s Journey',
    'Save the Cat',
    'The Story Circle',
    'Kishōtenketsu',
    'Freytag\'s Pyramid',
    'Seven-Point Story Structure',
    '22-Step Structure',
    'Pixar Story Structure',
    'Dramatica Theory',
    'Hollywood Beat Sheet'
  ];
  timelines = ['Linear', 'Non-linear'];
  createStory = {
    project_id: '',
    title: 'Untitled',
    structure: this.storyStructures[0],
    timeline: this.timelines[0]
  };
  saveTimeout: any;
  showCreateForm = false
  showAiAssistant = false;
  aiAssistantPosition = { top: 0, left: 0 };
  showTagsPopup = false
  private subs = new Subscription();

  constructor(
    private projectService: ProjectService,
    private projectDataService: ProjectDataService,
    private storyService: StoryService,
    private tagService: TagsService,
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit() {
    this.subs.add(
    this.route.queryParams.pipe(
      tap(params => {
        this.projectId = params['project_id']; 
        this.isProjectNew = params['is_new']; 
        this.isProjectPlan = params['is_plan']; 

        if (!this.projectId) {
          this.router.navigate(['/playground']);
        }
      }),
      filter(() => !!this.projectId),
      switchMap(() => this.projectDataService.project$),
      switchMap(res => {
        if (res == null) {
          return this.projectService.fetchProjectData(this.projectId).pipe(
            tap((response: any) => {
              this.projectDataService.setProject(response.project);
              this.projectData = response.project;
              this.stories = this.projectData.stories;
            })
          );
        } else {
          this.projectData = res;
          this.stories = this.projectData.stories || [];
          return []; // No further observable needed
        }
      })
    ).subscribe()
  );
  }

  toggleDrawer() {
    this.isDrawerOpen = !this.isDrawerOpen;
  }

  toggleCreateForm() {
    this.showCreateForm = !this.showCreateForm;
  }

  toggleTagsPopup() {
    this.showTagsPopup = !this.showTagsPopup;
  }

  trackByStoryTitle(index: number, story: any): string {
    return story?.name || index;
  }

  trackByTagName(index: number, tag: any): string {
    return tag?.name || index;
  }

  selectedStory(tab: any) {
    this.activeStory = tab;
  }

  createStoryData(form: any) {
    this.createStory.project_id = this.projectId;
    console.log('Story Submitted:', this.createStory);
    
    this.subs.add(
      this.storyService.createStory(this.createStory).subscribe({
        next: (res: any) => {
          console.log(res)
          this.projectDataService.setProject(res.project)
        },
        error: (err) => {
          console.error('Error:', err);
        }
      })
    )
  }

  onWritingChange() {
    clearTimeout(this.saveTimeout);
    this.saveTimeout = setTimeout(() => {
      this.saveDraft();
    }, 2000); // 2 seconds of inactivity
  }

  saveDraft() {
    console.log('Auto-saving draft:', this.activeStory.writing);
    this.subs.add(
      this.storyService.saveStory({
        project_id: this.projectId,
        story_id: this.activeStory.story_id,
        save_type: 'draft',
        writing: this.activeStory.writing
      }).subscribe({
        next: (res: any) => {
          console.log(res)
          this.projectDataService.setProject(res.project)
        },
        error: (err) => {
          console.error('Error saving story:', err);
        }
      })
    )
  }

  submitDraft() {
    this.subs.add(
      this.storyService.saveStory({
        project_id: this.projectId,
        story_id: this.activeStory.story_id,
        save_type: 'save',
        writing: this.activeStory.writing
      }).subscribe({
        next: (res: any) => {
          console.log(res)
          this.projectDataService.setProject(res.project)
        },
        error: (err) => {
          console.error('Error saving story:', err);
        }
      })
    )
  }

  searchTags() {
    this.subs.add(
      this.tagService.searchForTags({
        searchString: this.tagSearchText ? this.tagSearchText : '',
        idea: this.projectData.idea ? this.projectData.idea : '',
        genres: this.projectData.genres ? this.projectData.genres.join(", ") : '',
        story_types: this.projectData.story_types ? this.projectData.story_types : '', 
        target_age: this.projectData.target_age ? this.projectData.target_age.join(", ") : '',
        target_gender: this.projectData.target_gender ? JSON.stringify(this.projectData.target_gender) : ''
      }).subscribe({
        next: (res: any) => {
          console.log(res)
          this.searchedTags = res.data.tags
          this.searchedEntities = res.data.entities_used
          this.searchedTagType = res.data.search_type
        },
        error: (err) => {
          console.error('Error saving story:', err);
        }
      })
    )
  }

  selectTag(tag: any) {
    console.log(tag)
    
    // Check if tag is already selected
    if (this.isTagSelected(tag)) {
      this.removeSelectedTag(tag);
      return;
    }
    
    // Add to selected tags
    this.selectedTags.push(tag);
    
    // Fetch demographics for this tag
    let tag_id = tag.id || tag.tag_id;
    this.subs.add(
      this.tagService.getTagDemographics(tag_id).subscribe({
        next: (res: any) => {
          console.log(res)
          // Store demographics with tag info
          const tagWithDemographics = {
            ...tag,
            demographics: res.demographics
          };
          
          // Update the selected tag with demographics
          const index = this.selectedTags.findIndex(t => (t.id || t.tag_id) === tag_id);
          if (index !== -1) {
            this.selectedTags[index] = tagWithDemographics;
          }
          
          // Show current tag demographics
          this.currentTagDemographics = {
            tagName: tag.name,
            ...res.demographics
          };
        },
        error: (err) => {
          console.error('Error saving story:', err);
        }
      })
    )
  }
  
  isTagSelected(tag: any): boolean {
    const tagId = tag.id || tag.tag_id;
    return this.selectedTags.some(t => (t.id || t.tag_id) === tagId);
  }

  removeSelectedTag(tag: any) {
    const tagId = tag.id || tag.tag_id;
    this.selectedTags = this.selectedTags.filter(
      (t: any) => (t.id || t.tag_id) !== tagId
    );
    
    // Clear current demographics if this was the displayed tag
    if (this.currentTagDemographics?.tagName === tag.name) {
      this.currentTagDemographics = null;
    }
  }
  
  getAgeChartData() {
    if (!this.currentTagDemographics?.age) return [];
    
    return Object.entries(this.currentTagDemographics.age).map(([key, value]) => ({
      label: key.replace(/_/g, ' ').replace('and', '+'),
      value: value as number
    }));
  }
  
  getGenderChartData() {
    if (!this.currentTagDemographics?.gender) return [];
    
    return Object.entries(this.currentTagDemographics.gender).map(([key, value]) => ({
      label: key.charAt(0).toUpperCase() + key.slice(1),
      value: value as number
    }));
  }
  
  getAggregatedAgeData() {
    if (this.selectedTags.length === 0) return [];
    
    const ageGroups = ['24_and_younger', '25_to_29', '30_to_34', '35_to_44', '45_to_54', '55_and_older'];
    
    return ageGroups.map(ageGroup => {
      const total = this.selectedTags.reduce((sum, tag) => {
        return sum + (tag.demographics?.age?.[ageGroup] || 0);
      }, 0);
      const average = total / this.selectedTags.length;
      
      return {
        label: ageGroup.replace(/_/g, ' ').replace('and', '+'),
        value: average
      };
    });
  }
  
  getAggregatedGenderData() {
    if (this.selectedTags.length === 0) return [];
    
    const genders = ['male', 'female'];
    
    return genders.map(gender => {
      const total = this.selectedTags.reduce((sum, tag) => {
        return sum + (tag.demographics?.gender?.[gender] || 0);
      }, 0);
      const average = total / this.selectedTags.length;
      
      return {
        label: gender.charAt(0).toUpperCase() + gender.slice(1),
        value: average
      };
    });
  }
  
  saveDemographics() {
    const demographicsData = {
      project_id: this.projectId,
      target_demographics: {
        age: this.getAggregatedAgeData().reduce((acc, item) => {
          const key = item.label.replace(/\s/g, '_').replace('+', 'and').toLowerCase();
          acc[key] = item.value;
          return acc;
        }, {} as any),
        gender: this.getAggregatedGenderData().reduce((acc, item) => {
          acc[item.label.toLowerCase()] = item.value;
          return acc;
        }, {} as any)
      },
      selected_tags: this.selectedTags
    };
    
    console.log('Saving demographics:', demographicsData);
    // TODO: Make actual service call when ready
  }

  onDocumentChange(event: any) {
    this.activeStory.writing = event.target.innerHTML;
    this.onWritingChange();
  }

  onTextSelection(event: any) {
    const selection = window.getSelection();
    if (selection && selection.toString().trim().length > 0) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      
      this.aiAssistantPosition = {
        top: rect.bottom + window.scrollY + 10,
        left: rect.left + window.scrollX
      };
      
      this.showAiAssistant = true;
    } else {
      this.showAiAssistant = false;
    }
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
