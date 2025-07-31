import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PlaygroundComponent } from './playground.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AnalysisComponent } from './analysis/analysis.component';
import { CharacterMappingComponent } from './character-mapping/character-mapping.component';
import { ScriptWritingComponent } from './script-writing/script-writing.component';
import { StoryMappingComponent } from './story-mapping/story-mapping.component';
import { StoryWritingComponent } from './story-writing/story-writing.component';

const routes: Routes = [
  { path: '', component: PlaygroundComponent, children: [
    { path: 'dashboard', component: DashboardComponent },
    { path: 'analysis', component: AnalysisComponent },
    { path: 'character', component: CharacterMappingComponent },
    { path: 'script-writing', component: ScriptWritingComponent },
    { path: 'story-mapping', component: StoryMappingComponent },
    { path: 'story-writing', component: StoryWritingComponent }
  ]}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PlaygroundRoutingModule { }
