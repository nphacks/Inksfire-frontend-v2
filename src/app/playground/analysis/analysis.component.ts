import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

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
  private subs = new Subscription();

  constructor() {}

  ngOnInit(): void {
    // Component initialization
  }

  performSearch(): void {
    if (!this.searchQuery.trim()) {
      return;
    }

    console.log('Search query:', this.searchQuery);
    this.hasSearched = true;
    
    // TODO: Replace with actual service call
    // this.analysisService.search(this.searchQuery).subscribe(...)
    
    // Clear previous results and comparison
    this.searchResults = [];
    this.clearComparison();
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
      selected.id === result.id || selected.title === result.title
    );
  }

  removeResultFromSelection(result: any): void {
    this.selectedResults = this.selectedResults.filter(selected => 
      selected.id !== result.id && selected.title !== result.title
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
    console.log('Comparing results:', this.selectedResults);
    
    // TODO: Replace with actual service call
    // this.analysisService.compare(this.selectedResults[0], this.selectedResults[1]).subscribe(...)
    
    // Simulate API call delay
    setTimeout(() => {
      this.isComparing = false;
      // TODO: Set actual comparison data from service response
      this.comparisonData = null;
    }, 1000);
  }

  clearComparison(): void {
    this.selectedResults = [];
    this.comparisonData = null;
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}