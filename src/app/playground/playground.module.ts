import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PlaygroundRoutingModule } from './playground-routing.module';
import { PlaygroundComponent } from './playground.component';
import { StoryWritingComponent } from './story-writing/story-writing.component';
import { ScriptWritingComponent } from './script-writing/script-writing.component';
import { AnalysisComponent } from './analysis/analysis.component';
import { CharacterMappingComponent } from './character-mapping/character-mapping.component';
import { StoryMappingComponent } from './story-mapping/story-mapping.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { LoadingComponent } from './components/loading/loading.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { MatIconModule } from '@angular/material/icon';
import { ThemeNamePipe } from './pipes/theme-name.pipe';
import { TagTypePipe } from './pipes/tag-type.pipe';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    PlaygroundComponent,
    StoryWritingComponent,
    ScriptWritingComponent,
    AnalysisComponent,
    CharacterMappingComponent,
    StoryMappingComponent,
    NavbarComponent,
    LoadingComponent,
    DashboardComponent,
    ThemeNamePipe,
    TagTypePipe
  ],
  imports: [
    CommonModule,
    PlaygroundRoutingModule,
    MatIconModule,
    HttpClientModule,
    FormsModule
  ]
})
export class PlaygroundModule { }
