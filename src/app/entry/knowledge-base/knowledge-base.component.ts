import { Component, OnInit, Input, Output, EventEmitter, ElementRef } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

import { MeasureService } from 'src/app/entry/entry-content/measures/measures.service';
import { KnowledgeBaseService } from './knowledge-base.service';
import { PiaService } from 'src/app/services/pia.service';
import { StructureService } from 'src/app/services/structure.service';
import { AnswerStructureService } from 'src/app/services/answer-structure.service';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { KnowledgesService } from 'src/app/services/knowledges.service';
import { KnowledgeBase } from 'src/app/models/knowledgeBase.model';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-knowledge-base',
  templateUrl: './knowledge-base.component.html',
  styleUrls: ['./knowledge-base.component.scss'],
  providers: [PiaService, StructureService]
})
export class KnowledgeBaseComponent implements OnInit {
  searchForm: FormGroup;
  noTitle = false;
  @Input() item: any;
  @Output() newMeasureEvent: EventEmitter<any> = new EventEmitter<any>();
  customKnowledgeBases: KnowledgeBase[] = [];
  selectedKnowledBase: any = 0;

  constructor(
    private route: ActivatedRoute,
    private _measureService: MeasureService,
    public _knowledgeBaseService: KnowledgeBaseService,
    private el: ElementRef,
    private _translateService: TranslateService,
    private _piaService: PiaService,
    private _answerStructureService: AnswerStructureService,
    private _knowledgesService: KnowledgesService,
    private _structureService: StructureService
  ) {}

  ngOnInit() {
    this._piaService.getPIA();
    this.searchForm = new FormGroup({
      q: new FormControl()
    });
    window.onscroll = function(ev) {
      if (window.innerWidth > 640) {
        const el: any = document.querySelector('.pia-knowledgeBaseBlock');
        const el2 = document.querySelector('.pia-knowledgeBaseBlock-list');
        if (el && el2) {
          el2.setAttribute('style', 'height:' + (window.innerHeight - 350) + 'px');
          if (window.scrollY >= 100) {
            el.setAttribute('style', 'width:283px;');
            el.classList.add('pia-knowledgeBaseBlock-scroll');
          } else {
            el.setAttribute('style', 'width:auto;');
            el.classList.remove('pia-knowledgeBaseBlock-scroll');
          }
        }
      }
    };

    // LOAD CUSTOM KNOWLEDGE BASE
    this._knowledgesService
      .getAll()
      .then((result: any) => {
        this.customKnowledgeBases = result;
        // console.log('pia_' + this.route.snapshot.params.id + '_knowledgebase', localStorage.getItem('pia_' + this.route.snapshot.params.id + '_knowledgebase'))
        if (localStorage.getItem('pia_' + this.route.snapshot.params.id + '_knowledgebase')) {
          this.selectedKnowledBase = localStorage.getItem('pia_' + this.route.snapshot.params.id + '_knowledgebase');
        }
      })
      .catch(() => {});
  }

  /**
   * New knowledge base search query.
   */
  onSubmit() {
    this._knowledgeBaseService.translateService = this._translateService;
    this._knowledgeBaseService.q = this.searchForm.value.q;
    const filterBlock = this.el.nativeElement.querySelector('.pia-knowledgeBaseBlock-filters');
    if (filterBlock) {
      filterBlock.querySelector('button').click();
    }
    this._knowledgeBaseService.search();
  }

  /**
   * Allows an user to add a new measure (with its title and its placeholder) through the knowledge base.
   * @param {Event} event - Any kind of event.
   */
  addNewMeasure(event) {
    if (this._piaService.pia.id > 0) {
      this._measureService.addNewMeasure(this._piaService.pia, event.name, event.placeholder);
    } else if (this._structureService.structure.id > 0) {
      this._structureService.getStructure().then(() => {
        const title = this._translateService.instant(event.name);
        const measure = {
          title: title,
          content: ''
        };
        this._structureService.structure.data.sections
          .filter(s => s.id === 3)[0]
          .items.filter(i => i.id === 1)[0]
          .answers.push(measure);
        this._structureService.structure.update().then(() => {
          this.item.answers.push(measure);
        });
      });
    }
  }

  switch(selectedKnowledBase) {
    this._knowledgeBaseService
      .switch(selectedKnowledBase)
      .then(() => {
        this._knowledgeBaseService.loadByItem(this.item);
        // SET LOCALSTORAGE
        localStorage.setItem('pia_' + this.route.snapshot.params.id + '_knowledgebase', selectedKnowledBase);
      })
      .catch(err => {
        console.log(err);
      });
  }
}
