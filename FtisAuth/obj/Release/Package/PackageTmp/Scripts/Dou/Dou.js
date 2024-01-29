var transactionDouClientDataToServer = function (row, url, callback) {

    //將時間一律改UTC標準時間yyyy-MM-ddTHH:mm:ss.000Z(直接呼叫toJSON即可)
    var tjsondt = function (r) {
        if (Array.isArray(r)) {
            $.each(r, function () {
                tjsondt(this);
            });
        }
        else {
            for (var f in r) {    //json Date(/Date(1525730400000)/) 在serevr(可能無法DeSerialize)端會是null
                if (Array.isArray(r[f])) {
                    $.each(r[f], function () {
                        tjsondt(this);
                    });
                }
                else
                    if (r[f] && (r[f] + "").indexOf('/Date(') >= 0)
                        r[f] = JsonDateStr2Datetime(r[f]).toJSON();//.DateFormat("yyyy/MM/dd HH:mm:ss.S");
                    else if (r[f] && Object.prototype.toString.call(r[f]) === '[object Date]' && !isNaN(r[f]))
                        r[f] = r[f].toJSON();
            }
        }
    }
    tjsondt(row);
    var $_temp = this.rootParentContainer ? $(this.rootParentContainer) : $("body");
    if (helper && $_temp.length > 0)
        $_temp.show_busyIndicator({ timeout: 5000 });
    $.ajax({
        url: url,
        datatype: "json",
        type: "POST",
        data: { "objs": $.isArray(row) ? row : [row] }
    }).done(function (result, textStatus, jqXHR) {
        if (helper && $_temp.length > 0)
            $_temp.hide_busyIndicator();
        if (!result.Success && result.RedirectUrl) { //已timeout或後端重啟...等session中斷
            alert("已逾時，請重新登入!!");
            location.href = result.RedirectUrl;
            return;
        }

        callback(result);
        //修正資料後刪除cache，重載資料
        //hasChaneData = true;//20221121已用不到
        //console.log(result);
    })
        .fail(function (jqXHR, textStatus, errorThrown) {
            //$warnibfo.hide_busyIndicator();
            alert(jqXHR);
            if (helper && $_temp.length > 0)
                $_temp.hide_busyIndicator();
            callback({ Success: false, Desc: jqXHR });
        });
};


(function ($) {
    'use strict';
    $.editformWindowStyle = {
        modal: "modal",
        bottom: "bottom",
        right: "right",
        showEditformOnly: "showEditformOnly",
        detail: "detail",
    };
    $.douDatatype = {
        "default": "default",
        "number": "number",
        "datetime": "datetime",
        "date": "date",
        "boolean": "boolean",
        "select": "select",
        "textarea": "textarea",
        "email": "email",
        "password": "password",
        "image": "image"
    };
    $.douButtonsDefault = $.extend({ //可直接覆寫，但要放在load Dou.js前，jquery後
        add: 'btn-success glyphicon glyphicon-plus',
        update: 'btn-default btn-sm  glyphicon glyphicon-pencil',
        delete: 'btn-default btn-sm  glyphicon glyphicon-trash',
        deleteall: 'btn-danger glyphicon glyphicon-remove',
        view: 'btn-default btn-sm  glyphicon glyphicon-eye-open',
        query: 'btn-secondary'
    }, $.douButtonsDefault || {});
    $.edittableoptions = {
        rootParentContainer: "body",
        title: "",
        fields: [],//如要colspan、rowspan, this.settings.fields=[[....],[...]] >>2層
        _dataFields: [], //有定義對應資料欄位，fields如是一維array _dataFields =fields, 如fields是多層表頭轉單一array(僅資料欄位定義)
        search: true,
        cardView: false,
        toolbar: undefined,
        toolbarAlign: 'left',
        ctrlFieldAlign: 'right',
        height: undefined,
        addable: true,
        editable: true,
        deleteable: true,
        useMutiDelete: false,
        useMutiSelect: false,
        buttonClasses: {}, //douButtonsDefault，或直接override $.douButtonsDefault所有值
        editformMaxheight: undefined,
        editformLabelWidth: 12,//1~12
        editformLayoutUrl: undefined,/*edit layout template*/
        editformSize: { width: "auto", height: "auto", minWidth: 450, minHeight: 360 }, //height:fixed至中最大 >>modal用
        editformWindowClasses: undefined, /*modal-sm、modal-lg、modal-xl>> modal用*/
        editformWindowStyle: $.editformWindowStyle.modal,
        datas: [],
        singleDataEdit: false,
        singleDataEditCompletedReturnUrl: undefined,
        beforeCreateEditDataForm: undefined, //function (row, callback) {todo something....; callback();}
        afterCreateEditDataForm: undefined,//function($_container,row)
        afterEditDataConfirm: undefined,//編輯完資料，送到Server前
        addServerData: function (row, callback) { callback({ Success: true, data: row, Desc: '新增成功' }); },
        deleteServerData: function (row, callback) { callback({ Success: true, data: row, Desc: '刪除成功' }); },
        updateServerData: function (row, callback) { callback({ Success: true, data: row, Desc: '更新成功' }); },
        afterAddServerData: function (row, callback) { callback(); },//更新後端資料後，更新前端UI前
        afterUpdateServerData: function (row, callback) { callback(); },//更新後端資料後，更新前端UI前
        queryFilter: function (params, callback) { callback(); },
        appendCustomToolbars: [],//[{item, event, callback}] //Toolbars
        appendCustomFuncs: [],//[{item, event, callback}] //List Row ,ex:[{item:'<span class="btn btn-default btn-sm  glyphicon glyphicon-star" title="other"></span>',event:'click .glyphicon-star',callback:function(e, value, row, index){} }]
        tableOptions: {
            striped: true,
            mobileResponsive: true,
            detailFormatter: function detailFormatter(index, row) {
                //this.settings>>來至btn-view-data-manager
                //this.DouEditableTable.settings>>來至bootstraptable.detail
                var fs = (this.settings || this.DouEditableTable.settings)._dataFields;

                var html = [];
                $.each(fs, function () {
                    if (this.field.endsWith("-Start-Between_") || this.field.endsWith("-End-Between_") || this.field == "ctrl" || !this.visibleView)
                        return;
                    var v = row[this.field];
                    //html.push('<p><span class="detail-view-field"><b>' + this.title + '</b> </span>' + (this.formatter ? this.formatter(v) : v) + '</p>')
                    html.push('<tr><td class="detail-view-field"><b>' + this.title + '</b> </td><td>' + (this.formatter ? this.formatter(v) : v) + '</td></tr>')
                });
                return '<table class="table-borderless table-striped table-sm"><tbody>' + html.join('') + '</tbody></tbody>';
            },
            //search:true,
            formatSearch: function () {
                return '搜尋';
            }, formatNoMatches: function () {
                return '無符合資料';
            },
            formatLoadingMessage: function () {
                return '載入資料中，請稍候';
            },
            formatRecordsPerPage: function (pageNumber) {
                return '每頁顯示 ' + pageNumber + ' 項記錄';
            },
            formatShowingRows: function (pageFrom, pageTo, totalRows) {
                return '顯示第 ' + pageFrom + ' 到第 ' + pageTo + ' 筆資料，總共 ' + totalRows + ' 筆資料';
            },
            formatPaginationSwitch: function () {
                return '隱藏/顯示分頁';
            },
            formatRefresh: function () {
                return '刷新';
            },
            formatToggle: function () {
                return '切換';
            },
            formatColumns: function () {
                return '列';
            },
            onClickRow: function (item, $element) {
                return false;
            },
            formatAllRows: function formatAllRows() {
                return '*';
            },
            onLoadSuccess: function (datas) {
                return false;
            },
            onLoadError: function (status, dat) {
                console.log("load-error:" + status + "  " + dat.responseText);
                if (dat && (dat.responseText && dat.responseText.indexOf('dou-login-container') >= 0 || dat.RedirectUrl))
                    location.reload();//觸發導向login
                else
                    alert('資料讀取發生問題，請重新執行或洽管理員');
            }
        }
    }
    //sitems:{k1:v1,...} or {k1:{v:v1,s:s1,data1:other1,data2:other2...}} //k:真正值, v:畫面呈現, s:排序， data1、data2會作為option的data-data1、data-dat2
    var sortSelectItems = function (sitems) {
        var ritems = [];
        $.each(sitems, function (k, v) {//v如包含 @@，前是v，後是順序
            var vs = (v + "").split(/@@/g);
            var vs0 = vs[0].trim();
            var o = { k: k, v: vs0, s: vs[1] || 99 };
            if (vs0.startsWith('{') && vs0.endsWith('}')) //ex:vs0={"v":"Dispaly","dcode":"15"}
                $.extend(o, JSON.parse(vs0)); //o變成 { k: k, v: vs0, s: 99,,dcode:"15" };
            ritems.push(o);
        });
        ritems.sort(function (a, b) { return a.s - b.s; });
        return ritems;
    }

    var getSelectItemDisplay = function (v, r, sitems) {
        var _result = v;
        if (v != undefined) {
            _result = sitems[v] || v;
            _result = (_result + "").split(/@@/g)[0];
            if (_result.startsWith('{') && _result.endsWith('}'))
                _result = JSON.parse(_result).v;
        }
        _result = _result || v;
        return _result;
    }

    $.edittable_defaultEdit = {
        "default": {
            editContent: function ($_fieldContainer) {
                var $editEle = $('<input type="text"  class="form-control" data-fn="' + this.field + '" ' +
                    (this.placeholder ? 'placeholder="' + this.placeholder + '"' : (this.key || this.allowNull === false ? 'placeholder="不能空值"' : '')) +
                    (this.maxlength ? ' maxlength="' + this.maxlength + '"' : ' ') + ' ></input>').appendTo($_fieldContainer);

                if (this.defaultvalue)
                    $editEle.val(this.defaultvalue);
            },
            getValue: function ($editEle) {
                return $editEle.val();// .data("fn");
            },
            setValue: function ($editEle, v) {
                if (this.key || this.editable === false)
                    $editEle.prop('disabled', true);
                $editEle.val(v);
            }
        },
        "number": {
            editContent: function ($_fieldContainer) {
                var $editEle = $('<input type="text"  class=" form-control" data-fn="' + this.field + '" ' +
                    (this.placeholder ? 'placeholder="' + this.placeholder + '"' : (this.key || this.allowNull === false ? 'placeholder="不能空值"' : '')) +
                    (this.maxlength ? ' maxlength="' + this.maxlength + '"' : ' ') + ' ></input>').appendTo($_fieldContainer);

                if (this.defaultvalue)
                    $editEle.val(this.defaultvalue);

                $editEle.keydown(function (e) {
                    //console.log(e.keyCode);
                    // Allow: backspace, delete, tab, escape and enter
                    if ($.inArray(e.keyCode, [46, 8, 9, 27, 13]) !== -1 ||
                        // Allow: Ctrl+A, Command+A
                        (e.keyCode == 65 && (e.ctrlKey === true || e.metaKey === true)) ||
                        // Allow: home, end, left, right, down, up
                        (e.keyCode >= 35 && e.keyCode <= 40)) {
                        // let it happen, don't do anything
                        return;
                    }
                    // Ensure that it is a number and stop the keypress
                    if ((e.shiftKey || (e.keyCode < 48 || (e.keyCode > 57 && e.keyCode != 189 && e.keyCode != 190 && e.keyCode != 109 && e.keyCode != 110)))
                        && (e.keyCode < 96 || e.keyCode > 105)) {
                        e.preventDefault();
                    }
                    // 如果使用者輸入-，先判斷現在的值有沒有-，如果有，就不允許輸入
                    if ((e.keyCode == 109 || e.keyCode == 189) && /-/g.test(this.value)) {
                        e.preventDefault();
                    }
                    // 如果使用者輸入.，先判斷現在的值有沒有.，如果有，就不允許輸入
                    if ((e.keyCode == 110 || e.keyCode == 190) && /\./g.test(this.value)) {
                        e.preventDefault();
                    }
                });
                $editEle.keyup(function () {
                    if (/[^0-9\.-]/g.test(this.value)) {
                        this.value = this.value.replace(/[^0-9\.-]/g, '');
                    }

                    if (/-/g.test(this.value) && !/^-/g.test(this.value)) {
                        this.value = this.value.replace(/-/g, '');
                    }
                });
            },
            getValue: function ($editEle) {
                return $editEle.val();// .data("fn");
            },
            setValue: function ($editEle, v) {
                if (this.key || this.editable === false)
                    $editEle.prop('disabled', true);
                $editEle.val(v);
            }
        },
        "datetime": {
            editContent: function ($_fieldContainer) {
                var _id = 'id' + geguid();
                var $_dtp = $("<div id='" + _id + "' class='input-group date datetimeul datepick' data-fn='" + this.field + "'  data-target-input='nearest'>").appendTo($_fieldContainer);
                $('<input type="text" class="form-control datetimepicker-input" data-target="#' + _id + '"/>').appendTo($_dtp);
                $('<div class="input-group-addon input-group-append" data-target="#' + _id + '" data-toggle="datetimepicker"><span class="input-group-text"><i class="glyphicon glyphicon-calendar"></i></span></div>').appendTo($_dtp);
                var _format = 'YYYY/MM/DD HH:mm:ss';
                var _options = { locale: 'zh-tw', format: _format };
                if (this.editParameter) {
                    if (typeof (this.editParameter) === "string") {
                        this.editParameter = JSON.parse(this.editParameter);
                        //_format = this.editParameter.format;
                    }
                    //else
                    //    _format = this.editParameter.format
                    _options = $.extend(_options, this.editParameter)
                }

                $_dtp.datetimepicker(_options);

                if (this.defaultvalue) {
                    if (typeof this.defaultvalue === 'string' && this.defaultvalue.indexOf("new") >= 0)
                        $_dtp.datetimepicker("date", eval(this.defaultvalue));
                    else
                        $_dtp.datetimepicker("date", helper.format.JsonDateStr2Datetime(this.defaultvalue));
                }
                //$_dtp.datetimepicker("date", "show");
            },
            getValue: function ($editEle) {
                var _dtobjs = $editEle.datetimepicker("date");//.date();

                if (_dtobjs) {
                    return _dtobjs._d.DateFormat("yyyy/MM/dd HH:mm:ss");//避免JSON.stringify會變成TUC時間
                }
                else
                    return "";
            },
            setValue: function ($editEle, v) {
                if ((this.key || this.editable === false) && v != this.defaultvalue) //20210615 v == this.defaultvalue新增時
                    $editEle.find('> input').prop('disabled', true);
                var d = helper.format.JsonDateStr2Datetime(v);
                if (d)
                    $editEle.datetimepicker("date", d);//$editEle.data("DateTimePicker").date(d);
            }
        },
        "date": {
            editContent: function ($_fieldContainer) {
                var _id = 'id' + geguid();
                var $_dtp = $("<div id='" + _id + "' class='input-group date datetimeul datepick' data-fn='" + this.field + "'  data-target-input='nearest'>").appendTo($_fieldContainer);
                $('<input type="text" class="form-control datetimepicker-input" data-target="#' + _id + '"/>').appendTo($_dtp);
                $('<div class="input-group-addon input-group-append" data-target="#' + _id + '" data-toggle="datetimepicker"><span class="input-group-text"><i class="glyphicon glyphicon-calendar"></i></span></div>').appendTo($_dtp);
                var _format = 'YYYY/MM/DD';
                var _options = { locale: 'zh-tw', format: _format };
                if (this.editParameter) {
                    if (typeof (this.editParameter) === "string") {
                        this.editParameter = JSON.parse(this.editParameter);
                    }
                    _options = $.extend(_options, this.editParameter)
                }

                $_dtp.datetimepicker(_options);

                if (this.defaultvalue) {
                    if (typeof this.defaultvalue === 'string' && this.defaultvalue.indexOf("new") >= 0)
                        $_dtp.datetimepicker("date", eval(this.defaultvalue));
                    else
                        $_dtp.datetimepicker("date", helper.format.JsonDateStr2Datetime(this.defaultvalue));
                }
            },
            getValue: function ($editEle) {
                var _dtobjs = $editEle.datetimepicker("date");//.date();

                if (_dtobjs) {
                    return _dtobjs._d.DateFormat("yyyy/MM/dd");//避免JSON.stringify會變成TUC時間
                }
                else
                    return "";
            },
            setValue: function ($editEle, v) {
                if ((this.key || this.editable === false) && v != this.defaultvalue) //20210615 v == this.defaultvalue新增時
                    $editEle.find('> input').prop('disabled', true);
                var d = helper.format.JsonDateStr2Datetime(v);
                if (d)
                    $editEle.datetimepicker("date", d);//$editEle.data("DateTimePicker").date(d);
            }
        },
        "datetimeb3": {
            editContent: function ($_fieldContainer) {
                var $_dtp = $("<div class='input-group date datetimeul datepick' data-fn='" + this.field + "' >").appendTo($_fieldContainer);
                $('<input type="text" class="form-control" />').appendTo($_dtp);
                $('<span class="input-group-addon"><span class="glyphicon glyphicon-calendar"></span></span>').appendTo($_dtp);
                //$_dtp = $_dtp.find('input');
                var _format = 'YYYY/MM/DD HH:mm:ss';
                var _options = { locale: 'zh-tw', format: _format };
                if (this.editParameter) {
                    if (typeof (this.editParameter) === "string") {
                        this.editParameter = JSON.parse(this.editParameter);
                        //_format = this.editParameter.format;
                    }
                    //else
                    //    _format = this.editParameter.format
                    _options = $.extend(_options, this.editParameter)
                }

                $_dtp.datetimepicker(_options);

                if (this.defaultvalue) {
                    if (typeof this.defaultvalue === 'string' && this.defaultvalue.indexOf("new") >= 0)
                        $_dtp.datetimepicker("date", eval(this.defaultvalue));
                    else
                        $_dtp.datetimepicker("date", helper.format.JsonDateStr2Datetime(this.defaultvalue));
                }
            },
            getValue: function ($editEle) {
                var _dtobjs = $editEle.data("DateTimePicker").date();
                if (_dtobjs)
                    return _dtobjs._d.DateFormat("yyyy/MM/dd HH:mm:ss");//避免JSON.stringify會變成TUC時間
                else
                    return "";
            },
            setValue: function ($editEle, v) {
                if ((this.key || this.editable === false) && v != this.defaultvalue) //20210615 v == this.defaultvalue新增時
                    $editEle.find('> input').prop('disabled', true);
                var d = helper.format.JsonDateStr2Datetime(v);
                if (d)
                    $editEle.data("DateTimePicker").date(d);
            }
        },
        "dateb3": {
            editContent: function ($_fieldContainer) {
                var $_dtp = $("<div class='input-group date datetimeul' data-fn='" + this.field + "' >").appendTo($_fieldContainer);
                $('<input type="text" class="form-control" />').appendTo($_dtp);
                $('<span class="input-group-addon"><span class="glyphicon glyphicon-calendar"></span></span>').appendTo($_dtp);
                var _format = 'YYYY/MM/DD';
                var _options = { locale: 'zh-tw', format: _format };
                if (this.editParameter) {
                    if (typeof (this.editParameter) === "string") {
                        this.editParameter = JSON.parse(this.editParameter);
                    }
                    _options = $.extend(_options, this.editParameter)
                }

                $_dtp.datetimepicker(_options);
                if (this.defaultvalue) {
                    if (typeof this.defaultvalue === 'string' && this.defaultvalue.indexOf("new") >= 0)
                        $_dtp.datetimepicker("date", eval(this.defaultvalue));
                    else
                        $_dtp.datetimepicker("date", helper.format.JsonDateStr2Datetime(this.defaultvalue));
                }
            },
            getValue: function ($editEle) {
                var _dtobjs = $editEle.data("DateTimePicker").date();
                if (_dtobjs)
                    return _dtobjs._d.DateFormat("yyyy/MM/dd");//避免JSON.stringify會變成TUC時間
                else
                    return "";
            },
            setValue: function ($editEle, v) {
                if ((this.key || this.editable === false) && v != this.defaultvalue) //20210615 v == this.defaultvalue新增時
                    $editEle.find('> input').prop('disabled', true);
                var d = helper.format.JsonDateStr2Datetime(v);
                if (d)
                    $editEle.data("DateTimePicker").date(d);
            }
        },
        "boolean": {
            editContent: function ($_fieldContainer) {
                var $editEle = $('<input type="checkbox"  data-fn="' + this.field + '"></input>').appendTo($_fieldContainer);
                if (this.defaultvalue)
                    $editEle.val(this.defaultvalue);
            },
            getValue: function ($editEle) {
                return $editEle.is(":checked");// .data("fn");
            },
            setValue: function ($editEle, v) {
                if (this.key || this.editable === false)
                    $editEle.prop('disabled', true);
                if (v) $editEle.prop("checked", true);
            }
        },
        "textarea": {
            editContent: function ($_fieldContainer, v, flag) {
                var $editEle = undefined;
                if (flag) //filter
                    $editEle = $('<input class=" form-control"  data-fn="' + this.field + '" ></textarea>').appendTo($_fieldContainer);
                else
                    $editEle = $('<textarea rows="3" class=" form-control"  data-fn="' + this.field + '" ' + (this.key || this.allowNull === false ? 'placeholder="不能空值"' : '') +
                        (this.maxlength ? ' maxlength="' + this.maxlength + '"' : ' ') + '></textarea>').appendTo($_fieldContainer);
                if (this.defaultvalue)
                    $editEle.val(this.defaultvalue);
            },
            getValue: function ($editEle) {
                return $editEle.val();
            },
            setValue: function ($editEle, v) {
                if (this.key || this.editable === false)
                    $editEle.prop('disabled', true);
                $editEle.val(v);
            }
        },
        "select": {
            editContent: function ($_fieldContainer, _row, _appendEmpty) {
                if (this.selectitems === undefined)
                    alert("select 資料有問題");
                var result = [
                    '<select class="form-control" data-fn="' + this.field + '" >'
                ];
                if (typeof (this.selectitems) === "string")
                    this.selectitems = JSON.parse(this.selectitems);
                if (this.allowNull || _appendEmpty) ///_appendEmpty來至filter
                    result.push("<option value='' title='所有" + this.title + "'>選擇" + this.title + "</option>");

                var sitems = sortSelectItems(this.selectitems);//原資料v如包含@@，前是v，後是順序
                $.each(sitems, function () {
                    var datahtml = [];
                    for (var k in this) {
                        datahtml.push("data-" + k + "='" + this[k] + "'");
                    }
                    result.push("<option value='" + this.k + "' " + datahtml.join(" ") + ">" + this.v + "</option>");
                });
                result.push("</select>");
                //$_fieldContainer.append(result.join(' '));
                var $_s = $(result.join(' ')).appendTo($_fieldContainer);

                if (!_appendEmpty && this.defaultvalue != undefined) { //_appendEmpty=true來至filter
                    $_s.val(this.defaultvalue + "");
                }
                else
                    $_fieldContainer.find('select')[0].selectedIndex = 0;

            },
            getValue: function ($editEle) {
                return $editEle.val();
            },
            setValue: function ($editEle, v) {
                if (this.key || this.editable === false)
                    $editEle.prop('disabled', true);
                $editEle.val(v + "");//bool要變字串
            }
        },
        "radio": {
            editContent: function ($_fieldContainer, _row, _appendEmpty) {
                if (this.selectitems === undefined)
                    alert("radio selectitems 資料有問題");
                var radioname = 'rn' + Date.now();
                var $editEle = $('<div  data-fn="' + this.field + '" class="ftype-radio"></div>').appendTo($_fieldContainer);
                var radios = [
                ];
                if (typeof (this.selectitems) === "string")
                    this.selectitems = JSON.parse(this.selectitems);
                if (this.allowNull || _appendEmpty) ///_appendEmpty來至filter
                    radios.push('<label><input type="radio" name="' + radioname + '" value="">無</label>');

                var sitems = sortSelectItems(this.selectitems);//原資料v如包含@@，前是v，後是順序
                $.each(sitems, function () {
                    radios.push('<label><input type="radio" name="' + radioname + '" value="' + this.k + '">' + this.v + '</label>');
                });
                //$_fieldContainer.append(result.join(' '));
                var $_s = $(radios.join(' ')).appendTo($editEle);

                if (!_appendEmpty && this.defaultvalue != undefined) {//_appendEmpty=true來至filter
                    $_s.val(this.defaultvalue + "");
                    $('input[name="' + radioname + '"][value="' + this.defaultvalue + '"]', $editEle).prop('checked', true);
                }
                //else
                //    $_fieldContainer.find('select')[0].selectedIndex = 0;

            },
            getValue: function ($editEle) {
                return $('input:checked', $editEle).val();
            },
            setValue: function ($editEle, v) {
                if (this.key || this.editable === false)
                    $editEle.prop('disabled', true);
                if (v != undefined)
                    $('input[value="' + v + '"]', $editEle).prop('checked', true);
            }
        },
        "email": {
            editContent: function ($_fieldContainer) {
                var $editEle = $('<input type="email"  class="form-control" data-fn="' + this.field + '" ' +
                    (this.placeholder ? 'placeholder="' + this.placeholder + '"' : (this.key || this.allowNull === false ? 'placeholder="不能空值"' : '')) +
                    (this.maxlength ? ' maxlength="' + this.maxlength + '"' : ' ') + ' ></input>').appendTo($_fieldContainer);

                if (this.defaultvalue)
                    $editEle.val(this.defaultvalue);
            },
            getValue: function ($editEle) {
                return $editEle.val();// .data("fn");
            },
            setValue: function ($editEle, v) {
                if (this.key || this.editable === false)
                    $editEle.prop('disabled', true);
                $editEle.val(v);
            }
        },
        "password": {
            editContent: function ($_fieldContainer) {
                var $editEle = $('<input type="password"  class="form-control" data-fn="' + this.field + '" ' +
                    (this.placeholder ? 'placeholder="' + this.placeholder + '"' : (this.key || this.allowNull === false ? 'placeholder="不能空值"' : '')) +
                    (this.maxlength ? ' maxlength="' + this.maxlength + '"' : ' ') + ' ></input>').appendTo($_fieldContainer);

                if (this.defaultvalue)
                    $editEle.val(this.defaultvalue);
            },
            getValue: function ($editEle) {
                return $editEle.val();// .data("fn");
            },
            setValue: function ($editEle, v) {
                if (this.key || this.editable === false)
                    $editEle.prop('disabled', true);
                $editEle.val(v);
            }
        },
        "image": { //僅適用//IE(10+)	FIREFOX(3.6+)	CHROME(6.0+)	SAFARI(6.0+)	OPERA(11.1+)
            editContent: function ($_fieldContainer) {
                var current = this;
                var _txt = '<div><img ><a class="glyphicon l btn btn-default change-upload-btn" title="瀏覽" onclick="dataManagerIconUploadClick.call(this);">...</a>' +
                    '<input type="file" style="display:none;" name="page_icon_file" id="page_icon_file" onchange="dataManagerUploadFileChange.call(this);"></div>';
                if (!window.dataManagerIconUploadClick) {
                    window.dataManagerIconUploadClick = function () {
                        //var asdad = $(this)..parent("+ form > input");
                        $(this).parent().find("input:first").trigger("click");
                    };
                }
                if (!window.dataManagerUploadFileChange) {
                    window.dataManagerUploadFileChange = function () {
                        var __img = document.createElement("img"); //為了取檔案的大小、寬及高
                        __img.onload = function (ecc, bwfg) {
                            //$("#img_width", uploadPanel).val(__img.width);
                            //$("#img_height", uploadPanel).val(__img.height);
                        };
                        var img = $(this).parents("div:first").find("img");
                        if (!FileReader) {//navigator.userAgent.search("MSIE") > -1 || navigator.userAgent.search("Trident/") > -1) { //IE
                            img.attr('src', $(this).val());//只在IE上work
                            __img.src = img.attr('src');
                        }
                        else { //IE(10+)	FIREFOX(3.6+)	CHROME(6.0+)	SAFARI(6.0+)	OPERA(11.1+)
                            var file = this.files[this.files.length - 1];
                            var imageType = /image.*/;
                            if (file.type.match(imageType)) {//https://disp.cc/b/11-8uqn
                                var reader = new FileReader();
                                reader.onload = function (e) {
                                    __img.src = reader.result;
                                    if (current.imageMaxWidth && current.imageMaxHeight) {
                                        setTimeout(function () {
                                            var width = __img.width,
                                                height = __img.height,
                                                maxWidth = current.imageMaxWidth,
                                                maxHeight = current.imageMaxHeight;
                                            //寬或高大於設定的上限時，等比例縮小到符合上限
                                            if (width > height) {
                                                if (maxWidth > 0 && width > maxWidth) {
                                                    height *= maxWidth / width;
                                                    width = maxWidth;
                                                }
                                            } else {
                                                if (maxHeight > 0 && height > maxHeight) {
                                                    width *= maxHeight / height;
                                                    height = maxHeight;
                                                }
                                            }
                                            var canvas = document.createElement("canvas");
                                            canvas.width = width;
                                            canvas.height = height;

                                            var ctx = canvas.getContext("2d");


                                            // polyfill 提供了這個方法用來獲取設備的 pixel ratio
                                            var getPixelRatio = function (context) {
                                                var backingStore = context.backingStorePixelRatio ||
                                                    context.webkitBackingStorePixelRatio ||
                                                    context.mozBackingStorePixelRatio ||
                                                    context.msBackingStorePixelRatio ||
                                                    context.oBackingStorePixelRatio ||
                                                    context.backingStorePixelRatio || 1;

                                                return (window.devicePixelRatio || 1) / backingStore;
                                            };

                                            var userAgent = navigator.userAgent || navigator.vendor || window.opera;
                                            var isAndroid = userAgent.match(/Android/i) || userAgent.match(/Linux/i);//true
                                            var ratio = isAndroid ? 1 : getPixelRatio(ctx);
                                            //console.log("ratio:" + ratio);

                                            //console.log("width:" + width + " outwidth:" + width * ratio + " height:" + height + " outheight:" + height * ratio);
                                            //alert(ratio + "userAgent:" + userAgent + "userAgent1.match(/Android/i):" + isAndroid + ">>" + (width * ratio / __img.width) + ">>" + (height * ratio / __img.height));
                                            ctx.drawImage(__img, 0, 0, width * ratio, height * ratio);
                                            //將canvas轉為圖片的base64編碼
                                            var dataurl = canvas.toDataURL(file.type);
                                            console.log("dataurl.length2:" + dataurl.length)
                                            img.attr('src', dataurl);
                                        });
                                    } else
                                        img.attr('src', reader.result);
                                }
                                reader.readAsDataURL(file);
                            } else {
                                alert('File not supported!');
                            }
                        }
                        img.show();
                    };
                }
                $_fieldContainer.append(_txt);
            },
            getValue: function ($editEle) {
                return $editEle.find("img").attr("src");
            },
            setValue: function ($editEle, v) {
                $editEle.find("img").attr("src", v);
            }
        }
    }

    if ($.fn.datetimepicker && $.fn.datetimepicker.Constructor) { //for bootstrap4以上引用Tempus Dominus
        $.fn.datetimepicker.Constructor.Default = $.extend({}, $.fn.datetimepicker.Constructor.Default, {
            icons: {
                time: 'glyphicon glyphicon-time',
                date: 'glyphicon glyphicon-calendar',
                up: 'glyphicon glyphicon-chevron-up',
                down: 'glyphicon glyphicon-chevron-down',
                previous: 'glyphicon glyphicon-chevron-left',
                next: 'glyphicon glyphicon-chevron-right',
                today: 'glyphicon glyphicon-screenshot',
                clear: 'glyphicon glyphicon-trash',
                close: 'glyphicon glyphicon-remove'
            }
        });
    }

    $.dou = {
        events: {
            add: '--DataAdd--',
            upadte: '--DataUpadte--',
            delete: '--DataDelete--'
        }
    }
    var pluginName = 'DouEditableTable'
    var pluginclass = function (element, e) {
        try {
            $('body').addClass('bootstrp-version-' + helper.bootstrap.getversion());
        } catch (err) { }
        if (e) {
            e.stopPropagation();
            e.preventDefault();
        }
        this.$element = $(element);
        this.$rootParentContainer = undefined;
        this.settings = $.extend(true, {}, $.edittableoptions);// {map:undefined, width:240};
        this.$table = undefined;
        this.$___bootstraptable = undefined;
        this.$___currentEditFormWindow = undefined;
        this.$___filterToolbar = undefined;
        this.$_ctrlbtn = undefined;
    };
    pluginclass.prototype = {
        constructor: pluginclass,
        init: function (options) {
            var current = this;
            $.extend(true, this.settings, options);
            this.$rootParentContainer = typeof this.settings.rootParentContainer === "string" ? $(this.settings.rootParentContainer) : this.settings.rootParentContainer;


            this.settings.datas = options.datas; //如options.datas=[] ,則extend後this.settings.datas的實體還是原this.settings.datas[]的實體
            this.settings.tableOptions.search = this.settings.search;
            if (this.settings.cardView !== undefined)
                this.settings.tableOptions.cardView = this.settings.cardView;
            if (this.settings.editformWindowStyle == $.editformWindowStyle.detail) {
                this.settings.tableOptions.detailView = true;
                if (this.settings.tableOptions.detailViewIcon == undefined)
                    this.settings.tableOptions.detailViewIcon = false;
            }

            //_dataFields>>fields僅欄位定義內容
            var _f = function (_fd) {
                if ($.isArray(_fd)) { //多層表頭
                    $.each(_fd, function () {
                        _f(this);
                    });
                }
                else if (_fd.field)
                    current.settings._dataFields.push(_fd);
            }
            $.each(this.settings.fields, function () {
                _f(this);
            })
            ////

            $.each(this.settings._dataFields, function () {
                if (!this.editFormtter) {
                    if (this.datatype === "boolean")
                        $.extend(this, { editFormtter: $.edittable_defaultEdit.boolean });
                    else if (this.datatype === "number")
                        $.extend(this, { editFormtter: $.edittable_defaultEdit.number });
                    else if (this.datatype === "datetime")
                        $.extend(this, { editFormtter: $.edittable_defaultEdit.datetime });
                    else if (this.datatype === "date")
                        $.extend(this, { editFormtter: $.edittable_defaultEdit.date });
                    else if (this.datatype === "textarea")
                        $.extend(this, { editFormtter: $.edittable_defaultEdit.textarea });
                    else if (this.datatype === "image")
                        $.extend(this, { editFormtter: $.edittable_defaultEdit.image });
                    else if (this.datatype === "select")
                        $.extend(this, { editFormtter: $.edittable_defaultEdit.select });
                    else if (this.datatype === "radio")
                        $.extend(this, { editFormtter: $.edittable_defaultEdit.radio });
                    else if (this.datatype === "password")
                        $.extend(this, { editFormtter: $.edittable_defaultEdit.password });
                    else if (this.datatype === "email")
                        $.extend(this, { editFormtter: $.edittable_defaultEdit.email });
                    else
                        $.extend(this, { editFormtter: $.edittable_defaultEdit.default });
                }
                if ((this.datatype === "select" || this.datatype === "radio") && this.selectitems && typeof (this.selectitems) === "string") {
                    this.selectitems = JSON.parse(this.selectitems);
                }
                if ((this.datatype === "select" || this.datatype === "radio") && this.selectitems && !this.listFormatter) {
                    this.listFormatter = function (v, row) {
                        return getSelectItemDisplay(v, row, this.selectitems);
                        var _result = v;
                        if (v != undefined) { _result = this.selectitems[v] || v; }
                        return _result;
                    }
                }
                if (!this.formatter && this.listFormatter)
                    this.formatter = this.listFormatter;
                if (this.datatype === "number") {
                    var orgnumbervalidate = this.validate;
                    this.validate = function (v, row) {
                        if (v) {
                            if (orgnumbervalidate !== undefined) {
                                var _r = orgnumbervalidate(v, row);
                                if (_r !== true)
                                    return _r;
                            }

                            var _test = !(/[^0-9\.-]/g.test(v) || ((/-/g.test(v) && !/^-/g.test(v))));

                            return _test ? true : "格式有問題";
                        } return true;
                    }
                }
                if (this.datatype === "datetime" && !this.formatter) {
                    this.formatter = function (v, row) {
                        return v ? helper.format.JsonDateStr2Datetime(v).DateFormat("yyyy/MM/dd HH:mm:ss") : "---";
                    };
                }
                if (this.datatype === "date" && !this.formatter) {
                    this.formatter = function (v, row) {
                        try {
                            return v ? helper.format.JsonDateStr2Datetime(v).DateFormat("yyyy/MM/dd") : "---";
                        } catch (e) {
                            return v;
                        }
                    };
                }
                if (this.datatype === "image" && !this.formatter) {
                    this.formatter = function (v, row) {
                        return '<img src="' + v + '" class="dou-data-image">';
                    };
                }
                if (this.datatype === "email") {
                    if (!this.validate) {
                        this.validate = function (v, row) {
                            if (v) {
                                var filter = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
                                return filter.test(v) ? true : "email格式有問題";
                            } return true;
                        }
                    }
                }
                if ((this.key || this.allowNull === false)) {
                    var othervalidate = this.validate;
                    this.validate = function (v, row) {
                        if (othervalidate !== undefined && v) {
                            var _r = othervalidate(v, row);
                            if (_r !== true)
                                return _r;
                        }
                        return v ? true : "不能空值";
                    }
                }
                if (this.filter) {
                    current.__initFilter(this);
                }
            });
            if (this.settings.useMutiSelect || (this.settings.useMutiDelete == true && this.settings.deleteable == true)) {
                if ($.isArray(this.settings.fields[0])) //>>多層表頭
                    this.settings.fields[0].splice(0, 0, { checkbox: true, visibleEdit: false, rowspan: this.settings.fields.length });
                else
                    this.settings.fields.splice(0, 0, { checkbox: true, visibleEdit: false });
            }
            //button classes
            this.settings.buttonClasses = $.extend(JSON.parse(JSON.stringify($.douButtonsDefault)), this.settings.buttonClasses);
            if (this.$___filterToolbar) {
                this.$___filterToolbar.find(">.form-inline").append('<div class="form-group col-auto"><span  class="btn btn-confirm ' + this.settings.buttonClasses.query + '">查 詢</span></div>');
                this.settings.tableOptions.toolbarAlign = "right";
                this.settings.tableOptions.toolbar = this.$___filterToolbar;//this.settings.rootParentContainer + " > .filter-toolbar-plus";
            }
            if (this.settings.editable === true || this.settings.deleteable === true || this.settings.viewable == true || current.settings.appendCustomFuncs.length > 0) {
                //ctrl-header 為了card-view恐志向靠左用
                var _ctrf = {
                    field: "ctrl", title: "&nbsp;", cellStyle: { css: { "ctrl-header": "#aaa" } }, class: 'dou-ctrl-header', width: (current.settings.editable && current.settings.deleteable) ? 94 : 52, visibleEdit: false,
                    formatter: function (value, row) {
                        var _html = "";
                        if (current.settings.editable)
                            _html += '<span style="background-color:rgba(255,255,255,0);" class="btn btn-data-manager-ctrl btn-update-data-manager ' + current.settings.buttonClasses.update + '" title="修改" data-user-id="' + row.Id + '" data-ctrl="1"></span> ';
                        if (current.settings.deleteable)
                            _html += '<span style="background-color:rgba(255,255,255,0);" class="btn btn-data-manager-ctrl btn-delete-data-manager ' + current.settings.buttonClasses.delete + '" title="刪除" data-ctrl="2"></span>';
                        if (current.settings.viewable)
                            _html += '<span style="background-color:rgba(255,255,255,0);" class="btn btn-data-manager-ctrl btn-view-data-manager ' + current.settings.buttonClasses.view + '" title="檢視" data-ctrl="0"></span>';
                        if (current.settings.appendCustomFuncs)
                            $.each(current.settings.appendCustomFuncs, function () {
                                if (typeof this.item === 'function')
                                    _html += this.item.call(current, value, row);
                                else
                                    _html += this.item;
                            });
                        return _html;
                    },
                    events: {
                        'click .btn-update-data-manager': function (e, value, row, index) {
                            current.___update(row, index);
                        },
                        'click .btn-delete-data-manager': function (e, value, row, index) {
                            current.___delete(row, index);
                        },
                        'click .btn-view-data-manager': function (e, value, row, index) {
                            var c = current.settings.tableOptions.detailFormatter.call(current, index, row);
                            helper.jspanel.jspAlertMsg(undefined, { content: c, title: current.settings.title + '-詳細資料', autoclose: 999999 });
                        }
                    }
                };
                if (current.settings.appendCustomFuncs) {
                    $.each(current.settings.appendCustomFuncs, function () {
                        _ctrf.events[this.event] = this.callback;
                    });
                }
                if ($.isArray(this.settings.fields[0])) { //多階表頭
                    _ctrf.rowspan = this.settings.fields.length;
                    if (this.settings.ctrlFieldAlign == 'right')
                        this.settings.fields[0].push(_ctrf);
                    else
                        this.settings.fields[0].splice(0, 0, _ctrf);
                }
                else {
                    if (this.settings.ctrlFieldAlign == 'right')
                        this.settings.fields.push(_ctrf);
                    else
                        this.settings.fields.splice(0, 0, _ctrf);
                }
            }


            //resquest show BusyIndicator
            if (this.settings.tableOptions.queryParams && helper) {
                var orgqQueryParams = this.settings.tableOptions.queryParams;
                this.settings.tableOptions.queryParams = function (params) {
                    //改用bootsrtaptable的資訊
                    //helper.misc.showBusyIndicator(current.$rootParentContainer.find(".bootstrap-table > .fixed-table-container > .fixed-table-body>.fixed-table-loading"));
                    return orgqQueryParams(params)
                };
            }
            if (this.settings.tableOptions.responseHandler && helper) {
                var orgqResponseHandler = this.settings.tableOptions.responseHandler;
                this.settings.tableOptions.responseHandler = function (res) {
                    //helper.misc.hideBusyIndicator(current.$rootParentContainer.find(".bootstrap-table>.fixed-table-container>.fixed-table-body>.fixed-table-loading"));
                    return orgqResponseHandler(res)
                };
            }
            //單一資料編輯
            if (this.settings.singleDataEdit) {
                if (!this.settings.datas || this.settings.datas.length == 0) {
                    alert("單一資料編輯初始要給資料datas[1]");
                    if (this.settings.singleDataEditCompletedReturnUrl) {
                        if (typeof this.settings.singleDataEditCompletedReturnUrl == 'function')
                            this.settings.singleDataEditCompletedReturnUrl(null, false);
                        else
                            location.href = this.settings.singleDataEditCompletedReturnUrl;
                    }
                }
                this.settings.tableOptions.url = undefined;
            }
            this.settings.tableOptions.height = this.settings.height;
            this.settings.tableOptions.data = this.settings.datas;
            this.settings.tableOptions.columns = this.settings.fields; //含多層表頭


            //this.settings.tableOptions.toolbar = this.settings.toolbar;
            var orgOnLoadSuccess = this.settings.tableOptions.onLoadSuccess;
            this.settings.tableOptions.onLoadSuccess = function (res) { // 從新給settings.datas
                if ($.isArray(res))
                    current.tableReload(res, true); //無page
                else if ($.isArray(res.data))
                    current.tableReload(res.data, true);//有page
                else if (!res.Success && res.RedirectUrl) {
                    location.href = res.RedirectUrl; //已timeout或後端重啟...等session中斷
                    return;
                }
                else
                    alert("onLoadSuccess Error:" + JSON.stringify(res))

                if (orgOnLoadSuccess)
                    orgOnLoadSuccess(res);
            }

            this.createBootstrapTable();
            this.ctrlBtnListen();
        },
        showTableColumn: function (fn, _show) {
            if (this.$table) {
                var hf = this.$table.bootstrapTable('getHiddenColumns');
                var cfn = douHelper.getField(hf, fn);
                if (_show) {
                    if (cfn) //目前是hide
                        this.$table.bootstrapTable('showColumn', fn);
                }
                else {
                    if (!cfn) //目前是show
                        this.$table.bootstrapTable('hideColumn', fn);
                }
            }
        },
        createBootstrapTable: function () {
            var current = this;
            var $_leftToolbar;
            //this.settings.ta
            this.$table = this.$element.bootstrapTable(this.settings.tableOptions);
            this.$___bootstraptable = this.$table.parents(".bootstrap-table").first().addClass('dou-bootstrap-table');

            //bootstrap-table的columns(內建的table控制項，如匯出)放置最右
            this.$___bootstraptable.find('.fixed-table-toolbar > .columns').prependTo(this.$___bootstraptable.find('.fixed-table-toolbar'));

            this.$___bootstraptable.find('.fixed-table-container > .fixed-table-body').addClass('default-scrollbar');

            if (this.settings.classes) this.$___bootstraptable.addClass(this.settings.classes);
            if (this.settings.singleDataEdit) {
                this.$table.find(".btn-update-data-manager:first").trigger("click");
                return;
            }
            //setTimeout(function () {//為了解決table header寬度有問題
            //    //current.$element.bootstrapTable('resetWidth'); //1.20已無此method
            //}, 105);
            //this.$table.resize(function () {
            $(window).resize(function () {
                current.$element.bootstrapTable('resetView');
            });
            var $_ftToolbar = this.$table.parents(".bootstrap-table:eq(0)").find(">.fixed-table-toolbar");
            //$_ftToolbar.find(" > .search.pull-right").css("clear", "both"); //20221122
            $_ftToolbar.find(" > .search.float-right").css("clear", "both");


            this.$table.parents(".fixed-table-container").first().children(".fixed-table-header:eq(0)").addClass("fixed-table-header-extend");

            if (this.settings.addable || (this.settings.deleteable && this.settings.useMutiDelete) ||
                (this.settings.appendCustomToolbars && this.settings.appendCustomToolbars.length > 0)) {
                //$_leftToolbar = $_ftToolbar.find(" > .pull-left");//20221122
                $_leftToolbar = $_ftToolbar.find(" > .float-left");
                if ($_leftToolbar.length == 0)
                    $_leftToolbar = $('<div class="bars bs-bars float-left">').appendTo(this.$table.parents('.bootstrap-table').find(".fixed-table-toolbar"));
                    //$_leftToolbar = $('<div class="bars bs-bars pull-left">').appendTo(this.$table.parents('.bootstrap-table').find(".fixed-table-toolbar"));

                $_leftToolbar.addClass("btn-toolbar");
            }

            if (this.settings.addable) {
                $('<span class="btn btn-add-data-manager ' + this.settings.buttonClasses.add + '" >新 增</span>').appendTo($_leftToolbar).
                    click(function () {
                        current.___add();
                    });
            }

            //多筆刪除
            if (this.settings.deleteable && this.settings.useMutiDelete) {
                var $delAll = $('<span class="btn btn-delete-data-manager ' + this.settings.buttonClasses.deleteall + '">刪 除</span>').appendTo($_leftToolbar);
                $delAll.click(function () {
                    var chs = current.$table.find(" > tbody > tr.selected");
                    var sels = current.$table.bootstrapTable('getSelections');
                    if (sels.length == 0) {
                        jspAlertMsg($("body"), { autoclose: 3000, content: "尚未選擇欲刪除資料!!", classes: 'modal-sm' });
                        return;
                    }
                    var indexs = [];
                    $.each(current.$table.find(" > tbody > tr.selected"), function (_tr) {
                        indexs.push($(this).attr("data-index"));
                    })
                    current.___delete(sels, indexs)
                    //alert(JSON.stringify( current.$table.bootstrapTable('getSelections')));
                });
            }

            //appendCustomToolbars
            if (this.settings.appendCustomToolbars && this.settings.appendCustomToolbars.length > 0) {
                if (typeof this.settings.appendCustomToolbars === 'string') {
                    $_leftToolbar.append(this.settings.appendCustomToolbars);
                }
                else if ($.isArray(this.settings.appendCustomToolbars)) {
                    $.each(this.settings.appendCustomToolbars, function () {
                        var $el = $(this.item).appendTo($_leftToolbar);//.addClass('btn-sm');//給btn-sm why?20221013
                        $el.bind(this.event, this.callback);
                    });
                }
            }

            if (this.$___filterToolbar)
                this.$___filterToolbar.find(".btn-confirm").click(function () { current.___filter(); });



            $(".search > input", this.$___bootstraptabl).on('keyup', function () {
                setTimeout(function () {
                    console.log("ctrlBtnListen");
                    current.ctrlBtnListen();
                }, 500);
            });
        },
        ___getFiled: function (fn) {
            return douHelper.getField(this.settings.fields, fn);
        },
        ___add: function () {
            var current = this;
            var addindex = this.getData().length - 1;//editformWindowStyle-detail，將編輯放置最後一筆detail
            this.editDataForm("新增", null, undefined, function (urow) {
                var dsfsdf = this;
                if (urow) {

                    var autoclose = 2000;
                    current.settings.addServerData(urow, function (result) {
                        var sdfsggdf = this;
                        if (result.Success) {
                            if (result.data) {
                                for (var _key in result.data[0]) {
                                    if (result.data[0][_key] == null)
                                        delete result.data[0][_key];
                                }
                                $.extend(urow, result.data[0])
                            }
                            //if (!current.settings.datas)
                            //    current.settings.datas = [];

                            current.settings.afterAddServerData(urow, function () {
                                current.addDatas(urow);
                                current.ctrlBtnListen();
                                current.$element.trigger($.dou.events.add, [urow]);
                                //var ntr = current.$table.parent(".fixed-table-body")[0];
                                //ntr.scrollTop = ntr.scrollHeight;
                                //$("tr[data-index=" + (current.settings.datas.length - 1) + "]").hide().fadeIn(800);

                                current._editformWindowStyleEnd();
                                jspAlertMsg($("body"), { autoclose: autoclose, content: result.Desc, classes: 'modal-sm' });//.css("overflow", "hidden").css("width", "251");
                            });
                        } else {
                            current.$___currentEditFormWindow.trigger("set-error-message", result.Desc);
                        }
                    });
                }
            });
        },
        ___update: function (row, tableIdx) {
            var current = this;
            this.editDataForm("編輯", row, tableIdx, function (urow) {
                if (urow) { //urow是原row的實體
                    current.settings.updateServerData(urow, function (result) {
                        if (result.Success) {
                            if (current.settings.singleDataEdit) {
                                helper.jspanel.jspAlertMsg(current.$___currentEditFormWindow, { content: "編輯完成", classes: 'modal-sm' }, function () {
                                    if (current.settings.singleDataEditCompletedReturnUrl)
                                        if (typeof current.settings.singleDataEditCompletedReturnUrl == 'function')
                                            current.settings.singleDataEditCompletedReturnUrl(urow, true);
                                        else
                                            location.href = current.settings.singleDataEditCompletedReturnUrl;
                                });

                            }
                            else {
                                //current.tableReload();
                                if (result.data) {
                                    for (var _key in result.data[0]) {
                                        if (result.data[0][_key] == null)
                                            delete result.data[0][_key];
                                    }
                                    $.extend(urow, result.data[0])
                                }

                                var didx = current.___getDataIndex(row, urow);

                                current.settings.afterUpdateServerData(urow, function () {
                                    current.$table.bootstrapTable('updateRow', { index: didx, row: urow });
                                    //$.each(current.settings.datas,function())
                                    var tr = $(".fixed-table-body tbody tr[data-index=" + tableIdx + "]:eq(0)", current.$___bootstraptable);
                                    if (tr) {
                                        var $_tablebody = $(".fixed-table-body", current.$___bootstraptable);
                                        var pos = tr[0].offsetTop - tr.height();
                                        if (pos < $_tablebody[0].scrollTop || pos > ($_tablebody[0].scrollTop + $_tablebody.height())) {
                                            $(".fixed-table-body", current.$___bootstraptable)[0].scrollTop = tr[0].offsetTop - tr.height();// trh * rindex;
                                        }
                                        tr.hide();
                                        tr.fadeIn(600);
                                        current.$element.trigger($.dou.events.upadte, [urow]);
                                    }
                                    else
                                        console.log("找不到資料相對的tr tag index:" + didx);

                                    current._editformWindowStyleEnd();
                                });
                            }

                        } else {
                            console.log("result.Desc:" + result.Desc);
                            //var _id = $(".errormsg", current.$___currentEditFormWindow).html(result.Desc).show().attr('id');
                            //document.location = '#' + _id;
                            current.$___currentEditFormWindow.trigger("set-error-message", result.Desc);
                        }
                        current.ctrlBtnListen();
                        //current.$___currentEditFormWindow.trigger("transaction-dou-clientdata-to-Server-completed", result);

                    });
                }
                else
                    current.ctrlBtnListen();
            });
        },
        getSelections: function () { //取選取的資料
            if (this.$table)
                return this.$table.bootstrapTable('getSelections');
            else
                return [];
        },
        getData: function () {
            if (this.$table)
                return this.$table.bootstrapTable('getData');
            else
                return this.settings.datas;
        },
        removeDatas: function (_rows, _toServer) { //依內容移除前端資料，_toServer未實作
            var current = this;
            var removeidxs = [];
            $.each(_rows, function () {
                var didx = current.___getDataIndex(this);
                removeidxs.push(didx);
            })
            removeidxs.reverse();
            $.each(removeidxs, function () {
                if (this < 0) {
                    return;
                }
                current.settings.datas.splice(this, 1);
            });
            current.tableReload();
        },
        addDatas: function (_rows, _toServer, callback) {
            var current = this;
            if (_toServer) {
                helper.misc.showBusyIndicator(this.$table, { timeout: 180000 });
                current.settings.addServerData(_rows, function (result) {
                    helper.misc.hideBusyIndicator(current.$table);
                    if (result.Success) {
                        current.___appendDataToTable(result.data);
                        jspAlertMsg($("body"), { content: result.Desc, classes: 'modal-sm' });//.css("overflow", "hidden").css("width", "251");
                    } else {
                        jspAlertMsg($("body"), { autoclose: 60000, content: result.Desc });//.css("overflow", "hidden").css("width", "251");
                    }
                    if (callback)
                        callback(result);
                });
            } else {
                this.___appendDataToTable(_rows);
                if (callback)
                    callback(_rows);
            }
        },
        ___appendDataToTable: function (_datas) {
            var that = this;
            if (!this.settings.datas)
                this.settings.datas = [];
            var _appendDatas = $.isArray(_datas) ? _datas : [_datas];
            this.$table.bootstrapTable('append', _appendDatas);
            //if ($.isArray(_datas)) {
            _appendDatas.forEach(function (_d) {
                that.settings.datas.push(_d);
            });
            //$.each(_datas, function () {
            //});
            //}
            //else 
            //    this.settings.datas.push(_datas);//需放於.bootstrapTable('append', urow);後
            //current.$table.bootstrapTable('insertRow', {index:0, row:urow});

            var ntr = this.$table.parent(".fixed-table-body")[0];
            ntr.scrollTop = ntr.scrollHeight;
            for (var _i = 1; _i <= _appendDatas.length; _i++)
                $("tr[data-index=" + (this.settings.datas.length - _i) + "]").hide().fadeIn(2000);
        },
        ___delete: function (row, tableIdx) {
            var current = this;
            jspConfirmYesNo(current.$rootParentContainer, { content: "確定要刪除" + ($.isArray(row) ? (row.length + "筆") : "") + "資料?" }, function (confrim) {
                if (confrim) {
                    helper.misc.showBusyIndicator(current.$table, { timeout: 180000 });
                    current.settings.deleteServerData(row, function (result) {
                        helper.misc.hideBusyIndicator(current.$table);
                        if (result && result.Success) {
                            if ($.isArray(row)) { //多筆
                                if ("server" !== current.settings.tableOptions.sidePagination) {
                                    current.removeDatas(row);
                                }
                                else {

                                    current.$table.bootstrapTable("refresh");
                                }
                            } else {
                                var didx = current.___getDataIndex(row);
                                var tr = $(".fixed-table-body tbody tr[data-index=" + tableIdx + "]:eq(0)", current.$___bootstraptable);
                                if (didx >= 0 && tr) {
                                    current.settings.datas.splice(didx, 1);
                                    tr.fadeOut(500, function () {
                                        if ("server" !== current.settings.tableOptions.sidePagination) {
                                            current.tableReload();
                                            current.ctrlBtnListen();
                                        }
                                        else
                                            current.$table.bootstrapTable("refresh");
                                    });
                                }
                            }
                            current._editformWindowStyleEnd();
                            current.$element.trigger($.dou.events.delete, $.isArray(row) ? $.isArray(row) : [row]);
                        }
                        else
                            jspAlertMsg($("body"), { autoclose: 99999, content: result.Desc }).css("overflow", "hidden");//.css("width", "251");
                    });
                }
                else
                    current.ctrlBtnListen();
            });
        },
        ___getDataIndex: function (row) {
            var iidx = -1;
            var current = this;
            $.each(this.settings.datas, function (idx, d) {
                if (d === row) {
                    iidx = idx;
                    return false;
                }
            });
            if (iidx == -1) { //如row是自行組的或用$.extend或JSON.parse之類物件等不屬於this.settings.datas裡的資料，iidx會是-1
                if (!this._currentKeysField) {
                    this._currentKeysField = $.grep(this.settings._dataFields, function (_f) {
                        return _f.key == true;
                    });
                }
                $.each(this.settings.datas, function (idx, d) {
                    var _match = true;
                    $.each(current._currentKeysField, function () {
                        _match = row[this.field] == d[this.field];
                        if (_match)
                            return false;
                    });
                    if (_match) {
                        iidx = idx;
                        return false;
                    }
                });
            }
            return iidx;
        },
        ctrlBtnListen: function () {
            return; //改於columns的events給event
            var current = this;
            $(".btn-update-data-manager,.btn-delete-data-manager", this.$table).unbind('click').click(function (evt) { //修改
                current.$_ctrlbtn = $(evt.target);
            });
            this.$_ctrlbtn = undefined;
        },
        tableReload: function (_datas, _fromServer) {
            var sctop = this.$table.parent(".fixed-table-body")[0].scrollTop;
            if (_datas) {
                this.settings.datas = this.settings.tableOptions.data = _datas;
            }
            if (!_fromServer)
                this.$table.bootstrapTable('load', this.settings.datas);
            var $sinput = $(".search>input", this.$table.parents('.bootstrap-table').first());

            //$sinput.val("");

            this.$table.parent(".fixed-table-body")[0].scrollTop = sctop;
            this.ctrlBtnListen();
        },
        destroy: function () {
            if (this.$table)
                this.$table.bootstrapTable('destroy');
            this.settings = $.extend(true, {}, $.edittableoptions);
        },
        editDataForm: function (title, row, rowindex, callback) {
            if (!row) {
                row = {};
                $.each(this.settings._dataFields, function () {
                    //if (this.defaultvalue) row[this.field] = this.defaultvalue;//20190521 >>會造成新增時key或editable==false不能編輯, defaultvaue在editContent就會給
                });
            }
            row = row || {}; //20190521
            var rowTemp;//取消還原用
            try {
                if (row)
                    rowTemp = $.extend({}, row);
            } catch (ex) {
            }
            var current = this;
            var _beginCreateEditDataForm = function (_html) {
                //current.settings.editformWindowStyle = $.editformWindowStyle.modal;
                var _confirmAction = function (e) {

                    var rdata = row || {};
                    //將資料組成新資料
                    $.each(current.settings._dataFields, function (idx, f) {
                        //if (idx == current.settings.fields.length - 1) //ctrl 編輯、刪除
                        if (f.visibleEdit === false) {
                            //rdata[f.field] = row[f.field];
                            return;
                        }
                        var $_del = $(".field-container[data-field=" + f.field + "]", current.$___currentEditFormWindow).find(".field-content").children().first();
                        if ($_del.length > 0) {
                            var v = f.editFormtter.getValue.call(f, $_del, rdata);
                            rdata[f.field] = v;
                        }
                    });
                    var errors = [];
                    var firstErrorField;
                    //驗證
                    $.each(current.settings._dataFields, function (idx, f) {
                        if (f.visibleEdit === false)
                            return;
                        var $_del = $(".field-container[data-field=" + f.field + "]", current.$___currentEditFormWindow).find(".field-content").children().first();
                        var oer;
                        if ($_del.length > 0 && f.validate && (oer = f.validate(rdata[f.field], rdata)) !== true) {
                            errors.push(f.title + ":" + f.validate(rdata[f.field], rdata));
                            firstErrorField = firstErrorField ? firstErrorField : this;
                        }
                    });
                    var $_error = $(".errormsg", current.$___currentEditFormWindow).hide().empty();
                    if (errors.length > 0) {
                        current.$___currentEditFormWindow.trigger("set-error-message", '<span class="glyphicon glyphicon-exclamation-sign" aria-hidden="true"></span>&nbsp; ' + errors.join('<br><span class="glyphicon glyphicon-exclamation-sign" aria-hidden="true"></span>&nbsp; '));
                        //focus第一筆
                        $(".field-container[data-field=" + firstErrorField.field + "]", current.$___currentEditFormWindow).find(".field-content").children().first().focus();
                        return false;
                    }
                    if (current.settings.afterEditDataConfirm) {
                        if (current.settings.afterEditDataConfirm.length == 2) { //cb後再處理,如無cb就不做認呵處理
                            current.settings.afterEditDataConfirm(rdata, function () {
                                callback.call(current.$___currentEditFormWindow, rdata);
                            });
                        }
                        else {
                            current.settings.afterEditDataConfirm(rdata);
                            callback.call(current.$___currentEditFormWindow, rdata);
                        }
                    }

                    else
                        callback.call(current.$___currentEditFormWindow, rdata);
                };
                var _cancelAction = function (e) {
                    if (current.settings.singleDataEdit && current.settings.singleDataEditCompletedReturnUrl)
                        if (typeof current.settings.singleDataEditCompletedReturnUrl == 'function')
                            current.settings.singleDataEditCompletedReturnUrl(row, false);
                        else
                            location.href = current.settings.singleDataEditCompletedReturnUrl;
                    else {
                        /***********to do editformWindowStyle**************/
                        current._editformWindowStyleEnd();
                        if (row && rowTemp) //取消還原
                            for (var df in row)
                                row[df] = rowTemp[df];
                    }
                };


                //var $_form = $('</div><div name="form" action="" class="form-horizontal data-edit-form-group">'); //202206013 bt4
                var $_form = $('</div><div name="form" action="" class="form-horizontal data-edit-form-group">');


                var $_modal = $('<div data-backdrop="' + (current.settings.editformWindowStyle == $.editformWindowStyle.modal) + '" class="modal ' + ($.editformWindowStyle.modal == current.settings.editformWindowStyle ? 'fade' : '') +
                    ' ' + (current.settings.jsPanelClasses || "") + '" tabindex="-1" role="dialog" data-show="true"><div class="modal-dialog " role="document"><div class="modal-content"></div></div></div>').appendTo($(current.settings.rootParentContainer));

                var _size = calcEditFormSize(current.settings.editformSize, $_modal);
                $_modal.find('.modal-dialog').css('min-width', _size.minWidth);
                $_modal.find('.modal-dialog').css('min-height', _size.minHeight);
                if (_size.width != 'auto')
                    $_modal.find('.modal-dialog').css('width', _size.width);//.css('max-width', _size.width).css('width', _size.width);
                if (_size.height == 'fixed')
                    $_modal.find('.modal-content').height(_size.maxHeight);
                if (current.settings.editformWindowClasses)
                    $_modal.find('.modal-dialog').addClass(current.settings.editformWindowClasses);
                var $_content = $_modal.find('.modal-content');
                var $_header = $('<div class="modal-header"><h5 class="modal-title" id="myModalLabel">' + (current.settings.title + "-" + title) + '</h4></div>').appendTo($_content);
                var $_body = $('<div class="modal-body">').appendTo($_content);
                var $_footer = $('<div class="modal-footer">').appendTo($_content);
                var $_confirmbtn = $('<button type="button" class="btn btn-primary "> 確 定 </button>').appendTo($_footer);
                var $_closebtn = $('<button type="button" class="btn btn-default"> 取 消 </button>').appendTo($_footer);
                //data-bs-dismiss是5.0
                //額外加data-bs-dismiss按鈕，不直接將屬性加在取消鈕，方便"確認"及"取消"可一致呼叫關掉modal
                var $_dismissbtn = $('<button type="button" class="btn btn-default  data-dismiss" data-bs-dismiss="modal" data-dismiss="modal" style="display:none"> 取dfd 消 </button>').appendTo($_footer);

                if (_html && _html.indexOf("data-edit-form-group") < 0)
                    _html = $_form.append($(_html))[0].outerHTML;

                $_body.html('<div id="errormsg' + (new Date()).getTime() + '" class="errormsg alert alert-danger" style="display:none"></div>' + (_html ? _html : $_form[0].outerHTML));
                if (current.$___currentEditFormWindow) {
                    current._editformWindowStyleEnd();
                }
                current.$___currentEditFormWindow = $_modal;
                //$_modal.modal('show').on('hidden.bs.modal', function () {
                //    $_modal.remove(); //20210324原不會自動移除
                //    $_dismissbtn.trigger('click');
                //});
                //var _isFromConfirm = false;
                $_confirmbtn.click(function () {
                    if (_confirmAction() === false)
                        return;
                });
                $_closebtn.click(function () {
                    _cancelAction();
                });




                current.$___currentEditFormWindow.addClass("data-edit-jspanel");
                $_form = current.$___currentEditFormWindow.find(".data-edit-form-group");
                $.each(current.settings._dataFields, function (idx, f) {
                    if (f.visibleEdit === false)
                        return;
                    var $_content = undefined;
                    if (_html) {
                        $_content = $_form.find(".field-container[data-field=" + f.field + "] > .field-content");
                        if ($_content.length > 0)
                            f.editFormtter.editContent.call(f, $_content, row);
                    }
                    else {
                        var lw = current.settings.editformLabelWidth == 0 ? 12 : current.settings.editformLabelWidth;
                        var cw = lw == 0 || lw == 12 ? 12 : 12 - lw;
                        //form-group>> bootstrap<=4, mb-3>>bootstrap >=4
                        var $_formgroup = $('<div  class="form-group field-container row" data-field="' + f.field + '"><label class="col-sm-' + lw + ' control-label">' + f.title + '</label></div>').appendTo($_form);
                        $_content = $('<div class="field-content col-sm-' + cw + '"></div>').appendTo($_formgroup);
                        f.editFormtter.editContent.call(f, $_content, row);
                    }
                    if ($_content.children().length > 1) {
                        alert(this.name + " editContent內文第一層只能含一個dom");
                    }
                    if (row && row[f.field] != undefined && $_content.length > 0)
                        //if (row  && $_content.length > 0) 20210319
                        f.editFormtter.setValue.call(f, $_content.children().first(), row[f.field], row);
                });

                $(".jsPanel-hdr-r-btn-close .glyphicon-remove", current.$___currentEditFormWindow).hide();

                current.$___currentEditFormWindow.on("set-error-message", function (evt, msg) {
                    var _id = $(".errormsg", current.$___currentEditFormWindow).html(msg).show().attr('id');
                    document.location = '#' + _id;
                });
                if (current.settings.afterCreateEditDataForm)
                    current.settings.afterCreateEditDataForm.call(current, current.$___currentEditFormWindow, row);


                /***********to do editformWindowStyle**************/
                current._editformWindowStyleStart(row, rowindex);

                setTimeout(function () {
                    current.$___currentEditFormWindow.find(".data-edit-form-group input:enabled").first().focus();
                }, 501);//如modal 設 fade會有時間差問題
            }
            if (current.settings.editformLayoutUrl) {
                helper.misc.showBusyIndicator();
                $.get(current.settings.editformLayoutUrl, function (_html) {
                    helper.misc.hideBusyIndicator();
                    if (current.settings.beforeCreateEditDataForm)
                        current.settings.beforeCreateEditDataForm.call(current, row, jQuery.proxy(function () { _beginCreateEditDataForm(_html); }, current));
                    else
                        _beginCreateEditDataForm(_html);
                });
            }
            else {
                if (current.settings.beforeCreateEditDataForm)
                    current.settings.beforeCreateEditDataForm(row, jQuery.proxy(function () { _beginCreateEditDataForm(); }, current));
                else
                    _beginCreateEditDataForm();
            }

        },
        _editformWindowStyleStart: function (row, rowindex) {
            var current = this;
            this.$___currentEditFormWindow.show(); //因此時modal還沒實體modal
            this.$___currentEditFormWindow.addClass('window-style-' + this.settings.editformWindowStyle);
            //this.$___currentEditFormWindow.rowindex = rowindex; //detailstyle 為關掉detail用
            if ($.editformWindowStyle.detail === this.settings.editformWindowStyle) {

                this.$___currentEditFormWindow.rowindex = rowindex;
                var _ridx = this.$___currentEditFormWindow.rowindex;
                current.$___currentEditFormWindow.css('position', 'initial').find('>.modal-dialog').css('margin', '0');
                this.$table.find('.detail-icon').addClass('disabled');
                if (_ridx == undefined) { //新增
                    current.$___currentEditFormWindow.addClass('window-style-detail-add'); //為了style
                    current.$___currentEditFormWindow.insertAfter(this.$table.closest('.fixed-table-container'));//放置table下方
                }
                else {
                    this.$table.bootstrapTable('collapseRow', _ridx); //先關後開，避免settings detailView=true且該row已打開
                    this.$table.bootstrapTable('expandRow', _ridx, function (r, rr) {
                        return current.$___currentEditFormWindow; //將編輯內容變detail的內文
                    });
                }

                $('body .modal-backdrop.show').hide();
            }
            if ($.editformWindowStyle.showEditformOnly === this.settings.editformWindowStyle) {
                this.$___bootstraptable.hide(); //隱藏清單
                var $_mt = this.$table.closest('.body-content');

                this.$___currentEditFormWindow.insertBefore(this.$table.parents('.bootstrap-table').first()).css("position", "static").css("width", "auto").css("height", "auto").
                    css("min-width", "").css("min-height", "").css("max-height", "").find('.modal-content').css("height", "auto");//處理編輯視窗style
                $('body .modal-backdrop.show').hide();
            }
            if ($.editformWindowStyle.bottom === this.settings.editformWindowStyle) {
                this.$___currentEditFormWindow.appendTo(this.$rootParentContainer).css("position", "static").css("width", "").css("height", "").
                    css("min-width", "").css("max-height", "").css("min-height", "");//處理編輯視窗style
                $("body").animate({
                    scrollTop: $("body")[0].scrollTop + this.$___currentEditFormWindow.offset().top
                }, 1200);
            }
            if ($.editformWindowStyle.right === this.settings.editformWindowStyle) {
                this.$___bootstraptable.addClass("col-md-6 editformwindowstyletemp"); //隱藏清單
                this.$___currentEditFormWindow.addClass("col-md-6 editformwindowstyletemp");

                this.$___currentEditFormWindow.insertAfter(this.$___bootstraptable).css("position", "static").find('.modal-dialog').css("margin", "0");//.css("height", "").css("min-width", "").css("min-height", "");//處理編輯視窗style
            }
            if ($.editformWindowStyle.modal == this.settings.editformWindowStyle) {
                this.$___currentEditFormWindow.modal('show');
            }
            $('body').addClass('dou-edit-open').addClass('dou-edit-style-' + this.settings.editformWindowStyle);
        },
        _editformWindowStyleEnd: function () {//rowindex==undefined代表新增
            if (this.$___currentEditFormWindow == undefined)
                return;
            
            if ($.editformWindowStyle.detail === this.settings.editformWindowStyle) {
                var _ridx = this.$___currentEditFormWindow.rowindex;
                //if (_ridx == undefined) { //新增時需加一先加一筆
                // //this.addDatas(row);//_editformWindowStyleStart以加一筆
                //    //_ridx = this.getData().length - 1;
                //}
                this.$table.find('.detail-icon').removeClass('disabled');
                if (_ridx != undefined)
                    this.$table.bootstrapTable('collapseRow', _ridx);
            }
            if ($.editformWindowStyle.showEditformOnly === this.settings.editformWindowStyle)
                this.$___bootstraptable.show();
            if ($.editformWindowStyle.right === this.settings.editformWindowStyle) {
                if (this.$___bootstraptable.hasClass("editformwindowstyletemp"))
                    this.$___bootstraptable.removeClass("col-md-6").removeClass("editformwindowstyletemp");
                if (this.$___currentEditFormWindow.hasClass("editformwindowstyletemp"))
                    this.$___currentEditFormWindow.removeClass("col-md-6").removeClass("editformwindowstyletemp");
            }
            if (this.$___currentEditFormWindow) {
                this.$___currentEditFormWindow[0].isFromConfirm = true;
                if ($.editformWindowStyle.modal === this.settings.editformWindowStyle) {
                    this.$___currentEditFormWindow.find('.data-dismiss').trigger("click"); //讓modal自行close
                }
                else
                    this.$___currentEditFormWindow.remove();
            }

            this.$___currentEditFormWindow = undefined;
            $('body').removeClass('dou-edit-open').removeClass('dou-edit-style-' + this.settings.editformWindowStyle)
        },
        ___filter: function () {
            var _fielter = [];
            var current = this;
            $.each(this.$___filterToolbar.find("[data-fn]"), function () {
                var _fn = $(this).attr("data-fn");
                var _filed = current.___getFiled(_fn);
                _fielter.push({ key: _fn, value: _filed.editFormtter.getValue.call(_filed, $(this)) });
            });
            if (this.settings.queryFilter)
            //if (this.settings.tableOptions.url)
            {
                this.settings.queryFilter(_fielter, function (_result) {
                    if (_result !== undefined && $.isArray(_result)) {
                        current.tableReload(_result);
                        current.ctrlBtnListen();
                    }
                    else
                        current.$table.bootstrapTable("refresh", { filterColumns: _fielter }); //透過this.settings.tableOptions.url自動查詢
                });
            }
            else
                this.$table.bootstrapTable("refresh", { filterColumns: _fielter }); //透過this.settings.tableOptions.url自動查詢

        },
        __initFilter: function (_fileld) {
            if (!this.$___filterToolbar)
                this.$___filterToolbar = $('<div class="filter-toolbar-plus"><div class="form-inline row"></div></div>').appendTo(this.$rootParentContainer);
            var $_fg = $('<div class="form-group col-auto">').appendTo(this.$___filterToolbar.find(">.form-inline")); //col-auto用在bt5，但還有些須修正
            //var $_fg = $('<div class="form-group">').appendTo(this.$___filterToolbar.find(">.form-inline"));
            //sr-only 4.0 visually-hidden5.0
            $('<label class="sr-only visually-hidden">' + _fileld.title + '</label>').appendTo($_fg);
            _fileld.editFormtter.editContent.call(_fileld, $_fg, undefined, true);
            $_fg.find('[data-fn]').attr('placeholder', _fileld.title);
            var $_e = $_fg.find('[data-fn]').find("input, select").attr('placeholder', _fileld.title);
            if (_fileld.datatype == 'datetime' || _fileld.datatype == 'date') {
                $_e.on('mouseenter', function () {
                    $(this).attr('placeholder', _fileld.editParameter && _fileld.editParameter.format ? _fileld.editParameter.format :
                        (_fileld.datatype == 'datetime' ? 'YYYY/MM/DD h:m:s' : 'YYYY/MM/DD'));
                });
                $_e.on('mouseleave', function () {
                    $(this).attr('placeholder', _fileld.title);
                });
            }
        }
    }
    var calcEditFormSize = function (osize, $_modal) {
        var inh = window.innerHeight;
        var inw = window.innerWidth;
        var m_margintop = $_modal.find('.modal-dialog').css('margin-top').replace('px', '');
        m_margintop = m_margintop ? m_margintop : 30;
        //var m_margis = $_modal.find('.modal-dialog').offset();
        var _size = $.extend({}, osize);
        if (_size.minHeigth && _size.minHeigth > inh - m_margintop * 2)
            _size.minHeigth = inh - m_margintop * 2;
        if (_size.minWidth && _size.minWidth > inw - 40)
            _size.minWidth = inw - 40;


        if (_size.maxHeight && _size.maxHeight > inh - 40)
            _size.maxHeight = inh - 40;
        if (_size.maxWidth && _size.maxWidth > inw - 40)
            _size.maxWidth = inw - 40;
        if (!_size.maxHeight)
            _size.maxHeight = inh - m_margintop * 2 - 6;

        if (_size.maxHeight < _size.minHeight)
            _size.minHeight = _size.maxHeight;

        return _size;
    }
    $.fn[pluginName] = function (arg) {
        var sss;
        var args, instance;

        if (!(this.data(pluginName) instanceof pluginclass)) {

            this.data(pluginName, new pluginclass(this[0]));
        }

        instance = this.data(pluginName);


        if (typeof arg === 'undefined' || typeof arg === 'object') {

            if (typeof instance.init === 'function') {
                instance.init(arg);
            }
            this.instance = instance;
            return this;

        } else if (typeof arg === 'string' && typeof instance[arg] === 'function') {

            args = Array.prototype.slice.call(arguments, 1);

            return instance[arg].apply(instance, args);

        } else if (typeof arg === 'string' && instance.$table && instance.$table.bootstrapTable.methods.indexOf(arg)>=0) { //直接呼叫bootstrapTable method

            args = Array.prototype.slice.call(arguments, 1);

            return instance.$table.bootstrapTable(arg, args.length==1?args[0]:args);
            //return instance.$table.bootstrapTable.call(instance.$table,arg, args);

        } else {

            $.error('Method ' + arg + ' does not exist on jQuery.' + pluginName);

        }
    };

    $.fn['DouTable'] = $.fn[pluginName];
    $.fn['douTable'] = $.fn[pluginName];
    window.douHelper = window.douHelper || {};
    window.douHelper.getField = function (fields, title) {
        var fns = [];
        var _f = function (_fd) {
            if ($.isArray(_fd)) { //多層表頭
                $.each(_fd, function () {
                    _f(this);
                });
            }
            else if (_fd.field == title)
                fns.push(_fd);
        }
        $.each(fields, function () {
            _f(this);
        })
        return fns.length > 0 ? fns[0] : undefined;
    }

})(jQuery);

!function ($) {  /******* for filter*********/
    'use strict';

    if (!$.fn.bootstrapTable) {
        alert("尚未載入$.fn.bootstrapTable");
    }
    var BootstrapTable = $.fn.bootstrapTable.Constructor,
        _refresh = BootstrapTable.prototype.refresh,
        _resetView = BootstrapTable.prototype.resetView;

    BootstrapTable.prototype.refresh = function (params) {
        this.filterColumnsPartial = params && params.filterColumns;
        _refresh.apply(this, Array.prototype.slice.apply(arguments));
    }
    BootstrapTable.prototype.resetView = function (params) {
        //if (params && params.options) {
        if (this.options.cardView)
            this.$el.addClass('card-view-table');
        else
            this.$el.removeClass('card-view-table');
        //}
        _resetView.apply(this, Array.prototype.slice.apply(arguments));
    }
    var dsasd = $.fn.bootstrapTable;
    $.fn.bootstrapTable.Constructor.DEFAULTS.iconsPrefix = "glyphicon";
    $.fn.bootstrapTable.Constructor.DEFAULTS.icons = {
        paginationSwitchDown: 'glyphicon-collapse-down icon-chevron-down',
        paginationSwitchUp: 'glyphicon-collapse-up icon-chevron-up',
        refresh: 'glyphicon-refresh icon-refresh',
        toggleOff: 'glyphicon-list-alt icon-list-alt',
        toggleOn: 'glyphicon-list-alt icon-list-alt',
        columns: 'glyphicon-th icon-th',
        detailOpen: 'glyphicon-plus icon-plus',
        detailClose: 'glyphicon-minus icon-minus',
        fullscreen: 'glyphicon-fullscreen',
        search: 'glyphicon-search',
        clearSearch: 'glyphicon-trash'
    }
    //Constants.CONSTANTS = CONSTANTS["3"]; //bt3 引用就ICON
    //$.fn.bootstrapTable.Constructor.DEFAULTS.icons.detailOpen = 'glyphicon glyphicon-eye-open icon-plus';
    //$.fn.bootstrapTable.Constructor.DEFAULTS.icons.detailClose = 'glyphicon glyphicon-eye-close icon-minus';
}(jQuery);

