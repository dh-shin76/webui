import { Component } from '@angular/core';
import * as _ from 'lodash';
import { FormGroup, Validators } from '@angular/forms';
import { FieldConfig } from '../../../../../common/entity/entity-form/models/field-config.interface';
import { WebSocketService, RestService } from '../../../../../../services';
import { ActivatedRoute, Router } from '@angular/router';
import helptext from '../../../../../../helptext/services/components/service-rsync';

@Component({
  selector : 'app-rsync-configuration-form',
  template : `<entity-form [conf]="this"></entity-form>`
})

export class RYSNCConfigurationFormComponent {
    protected resource_name = 'services/rsyncmod/';
    protected route_success: string[] = [ 'services','rsync','rsync-module' ];
    protected isEntity = true;
    public formGroup: FormGroup;
    protected pk: any;
    protected addCall = 'rsyncmod.create';
    protected isNew: boolean;
    public fieldConfig: FieldConfig[] = [
    {
        type: 'input',
        name: 'name',
        placeholder: helptext.rsyncmod_name_placeholder,
        tooltip: helptext.rsyncmod_name_tooltip,
        validation: Validators.required,
        required: true
    },
    {
        type: 'input',
        name: 'comment',
        placeholder: helptext.rsyncmod_comment_placeholder,
        tooltip: helptext.rsyncmod_comment_tooltip
    },
    {
        type : 'explorer',
        initial: '/mnt',
        explorerType: 'directory',
        placeholder: helptext.rsyncmod_path_placeholder,
        name: 'path',
        tooltip: helptext.rsyncmod_path_tooltip,
        validation: helptext.rsyncmod_path_validation,
        required: true
    },
    {
        type: 'select',
        name: 'mode',
        placeholder: helptext.rsyncmod_mode_placeholder,
        options: helptext.rsyncmod_mode_options,
        tooltip: helptext.rsyncmod_mode_tooltip,
        required: true
    },
    {
        type: 'input',
        name: 'maxconn',
        placeholder: helptext.rsyncmod_maxconn_placeholder,
        inputType: 'number',
        value: 0,
        validation: helptext.rsyncmod_maxconn_validation,
        tooltip: helptext.rsyncmod_maxconn_tooltip,
    },
    {
        type: 'select',
        name: 'user',
        placeholder: helptext.rsyncmod_user_placeholder,
        tooltip: helptext.rsyncmod_user_tooltip,
        options: []
    },
    {
        type: 'select',
        name: 'group',
        placeholder: helptext.rsyncmod_group_placeholder,
        tooltip: helptext.rsyncmod_group_tooltip,
        options: []
    },
    {
        type: 'textarea',
        name: 'hostsallow',
        placeholder: helptext.rsyncmod_hostsallow_placeholder,
        tooltip: helptext.rsyncmod_hostsallow_tooltip,
        value: '',
      },
      {
        type: 'textarea',
        name: 'hostsdeny',
        placeholder: helptext.rsyncmod_hostsdeny_placeholder,
        tooltip: helptext.rsyncmod_hostsdeny_tooltip,
        value: '',
      },
      {
        type: 'textarea',
        name: 'auxiliary',
        placeholder: helptext.rsyncd_auxiliary_placeholder,
        tooltip: helptext.rsyncd_auxiliary_tooltip,
        value: '',
      },

    ];
    private rsyncmod_group: any;
    private rsyncmod_user: any;
    protected entityForm: any;
    protected customFilter: any;
    constructor( protected ws: WebSocketService, protected router: Router,
        protected rest: RestService, protected route: ActivatedRoute) {
    }

    afterInit(entityForm: any) {
        this.entityForm = entityForm;
        this.isNew = entityForm.isNew;

        this.rsyncmod_user = _.find(this.fieldConfig, {name : "user"});
        entityForm.ws.call('user.query').subscribe((users) => {
            users.forEach((user) => {
                this.rsyncmod_user.options.push({label : user.username, value : user.username})
            });
        });
        this.rsyncmod_group = _.find(this.fieldConfig, {name : "group"});
        entityForm.ws.call('group.query').subscribe((groups) => {
            groups.forEach((group) => {
                this.rsyncmod_group.options.push({label : group.group, value : group.group})
            });
        });

        if (this.isNew) {
            entityForm.formGroup.controls['mode'].setValue('RO');
        }

        this.route.params.subscribe(params => {
            if (params['pk']) {
              this.pk = parseInt(params['pk']);
              this.ws.call('rsyncmod.query', [
                [
                  ["id", "=", this.pk]
                ]
              ]).subscribe((res) => {
                for (const i in res[0]) {
                    if (i !== 'id') {
                        entityForm.formGroup.controls[i].setValue(res[0][i])
                    }
                };
              });
            };
        });

        if (!this.isNew) {
            entityForm.submitFunction = this.submitFunction;
        };
    }

    beforeSubmit(data: any) {
        if (!data.hostsallow || data.hostsallow === '') {
            data.hostsallow = [];
        } else if (typeof(data.hostsallow) === 'string') {
            data.hostsallow = data.hostsallow.split(/[ ,]+/);
        }
        if (!data.hostsdeny || data.hostsdeny === '') {
            data.hostsdeny = []
        } else if (typeof(data.hostsdeny) === 'string') {
            data.hostsdeny = data.hostsdeny.split(/[ ,]+/);
        }
    }

    submitFunction(entityForm: any){
        return this.ws.call('rsyncmod.update', [this.pk, entityForm]);
      };
}
