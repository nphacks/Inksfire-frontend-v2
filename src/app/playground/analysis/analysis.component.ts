import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { ProjectService } from '../services/project.service';

@Component({
  selector: 'app-analysis',
  templateUrl: './analysis.component.html',
  styleUrl: './analysis.component.scss'
})
export class AnalysisComponent implements OnInit, OnDestroy {
  
  searchQuery: string = '';
  searchResults: any[] = [];
  selectedResults: any[] = [];
  comparisonData: any = null;
  hasSearched: boolean = false;
  isComparing: boolean = false;
  isSearchResultsCollapsed: boolean = false;
  private subs = new Subscription();

  constructor(private projectService: ProjectService) {}

  ngOnInit(): void {
    // Component initialization
  }

  performSearch = (): void => {
    if (!this.searchQuery.trim()) {
      return;
    }

    console.log('Search query:', this.searchQuery);
    this.hasSearched = true;
    
    this.projectService.searchForMovies(this.searchQuery).subscribe({
      next: (res: any) => {
        console.log(res.movie_information)
        this.searchResults = res.movie_information
      },
      error(err) {
        console.error(err)
      },
    })
  }

  toggleResultSelection(result: any, index: number): void {
    if (this.isResultSelected(result)) {
      this.removeResultFromSelection(result);
    } else if (this.selectedResults.length < 2) {
      this.selectedResults.push(result);
      console.log('Selected result:', result);
    }
    
    // Clear comparison when selection changes
    this.comparisonData = null;
  }

  isResultSelected(result: any): boolean {
    return this.selectedResults.some(selected => 
      selected.entity_id === result.entity_id || selected.name === result.name
    );
  }

  removeResultFromSelection(result: any): void {
    this.selectedResults = this.selectedResults.filter(selected => 
      selected.entity_id !== result.entity_id && selected.name !== result.name
    );
    this.comparisonData = null;
  }

  removeSelection(index: number): void {
    if (index >= 0 && index < this.selectedResults.length) {
      this.selectedResults.splice(index, 1);
      this.comparisonData = null;
      console.log('Removed selection at index:', index);
    }
  }

  compareResults(): void {
    if (this.selectedResults.length !== 2) {
      return;
    }
    
    this.isComparing = true;
    let entities = [this.selectedResults[0]["entity_id"], this.selectedResults[1]["entity_id"]]
    this.projectService.compareMovies(entities).subscribe({
      next: (res: any) => {
        this.comparisonData = res.movie_compare.tags
        console.log(res.movie_compare)
      },
      error(err) {
        console.error(err)
      },
    })
  }

  clearComparison(): void {
    this.selectedResults = [];
    this.comparisonData = null;
  }

  toggleSearchResults(): void {
    this.isSearchResultsCollapsed = !this.isSearchResultsCollapsed;
  }

  getEntityType(types: string | string[]): string {
    if (!types) return 'Unknown';
    
    const typeArray = Array.isArray(types) ? types : [types];
    const firstType = typeArray[0];
    
    if (!firstType) return 'Unknown';
    
    // Extract the entity type from URN format (e.g., "urn:entity:movie" -> "Movie")
    const parts = firstType.split(':');
    if (parts.length >= 3) {
      const entityType = parts[2];
      // Capitalize first letter and handle special cases
      switch (entityType) {
        case 'movie':
          return 'Movie';
        case 'tv_show':
          return 'TV Show';
        case 'person':
          return 'Person';
        case 'book':
          return 'Book';
        default:
          return entityType.charAt(0).toUpperCase() + entityType.slice(1);
      }
    }
    
    return 'Unknown';
  }
  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}
