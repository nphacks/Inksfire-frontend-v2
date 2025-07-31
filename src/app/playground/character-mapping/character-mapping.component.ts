import { Component, OnInit } from '@angular/core';
import { ProjectDataService } from '../services/project-data.service';

@Component({
  selector: 'app-character-mapping',
  templateUrl: './character-mapping.component.html',
  styleUrl: './character-mapping.component.scss'
})
export class CharacterMappingComponent implements OnInit {

  constructor(private projectDataService: ProjectDataService) {}
  projectData: any
  stories: any = []
  characterList: any = []
  characterMap: any = []

  ngOnInit(): void {
    this.projectDataService.project$.subscribe({
      next: (res: any) => {
        this.projectData = res
        this.stories = res.stories
        this.characterList = res.stories[0].character_mapping.characters
        this.characterMap = res.stories[0].character_mapping.relationships
        console.log(this.stories)
        console.log(this.characterList, this.characterMap)
      },
      error(err) {
          console.error(err)
      },
    })
  }

}
