(function () {
    'use strict';

    var TOKEN = decodeURIComponent(getCookie("oauth_token_secret-adminUI")).replace(/\"/gi, '');
    var total_records = 0;
    var records = 0;
    var array = [];

    $(document).ready(function () {

        $(window).on('hashchange', function() {
            var page = window.location.hash;
            console.log(page);
            if (page.includes('settings/extensions')) {
                setTimeout(function () {
                    loadExtensions();
                    createEnterBind()
                },4000);
            }

        });
        setTimeout(function () {
            loadExtensions();
            createEnterBind();
            $('#cc-extensionIDs-table-container').removeClass('pull-right');
        }, 8000);
    });

    function createEnterBind () {
        $('#findExtension-id').keypress(function(e){
            if (e.which == 13){
                search();
            }
        });
    }

    function loadExtensions() {

        $('#devTab #cc-extensionIDs-table-container').before('<input id="findExtension-id" class="" value="" placeholder="Informe o nome da extensão" style="min-width:250px; padding: 5px;">');
        $('#findExtension-id').after('<button id="custom-go-button" style="margin-left: 10px; padding: 5px;" class="oj-button-jqui oj-button oj-component oj-enabled oj-button-full-chrome oj-button-text-icon-start oj-component-initnode oj-default">Buscar</button>');
        $('#custom-go-button').click(function () {
            search();
        });

        $('#devTab').click(function () {
            if (total_records == 0) {
                ajaxCaller();
            }
        });

        $('#cc-extensionIDs-table').before('<div id="occ_prime" style="display:none"></div>');
        $('#occ_prime').html('<table style="width: 100%;" class="table">' +
                             '<thead>' +
                             '<tr>' +
                             '<th scope="col">Status</th>' +
                             '<th scope="col">Name</th>' +
                             '<th scope="col">ID</th>' +
                             '<th scope="col">Created By</th>' +
                             '<th scope="col">Page</th>' +
                             '</tr>' +
                             '</thead>' +
                             '<tbody>' +
                             '</tbody>' +
                             '</table>');
    };

    function getCookie(key) {
        var keyValue = document.cookie.match('(^|;) ?' + key + '=([^;]*)(;|$)');
        return keyValue ? keyValue[2] : null;
    }

    function ajaxCaller() {
        var self = this;

        $.ajax({
            url: location.protocol +"//"+ location.host +"/ccadminui/v1/applicationIds?type=extension&limit=250&offset=" + records,
            type: "GET",
            dataType: "json",
            headers: {
                "Cache-Control": "no-cache",
                'Content-Type': 'application/json',
                "Authorization": 'Bearer ' + TOKEN
            },
            success: function (data) {
                total_records = data.totalResults;
                records += data.items.length;
                array = array.concat(data.items);
                console.log(array);

                if (records < total_records) {
                    ajaxCaller();
                }
            },
            error: function (xhrs) {
                console.log(xhrs);
            }
        });
    }

    function search() {
        $('#occ_prime').css('display', 'block');
        var name = $('#findExtension-id').val();
        console.log(name);
        var filtered = [];
        var index_record = [];
        $('#occ_prime table tbody').html('');
        var filterExtensionName = function (elm, index) {
            var elm_name = elm.name.toLowerCase();
            name = name.toLowerCase();
            if (elm_name.includes(name)) {
                index_record.push(index);
                return elm;
            }
        };

        filtered = array.filter(filterExtensionName);

        console.log('Filtered ->', filtered);

        filtered.forEach(function (item, index) {
            var status = '';
            var createdBy;
            var recordsPerPage = 40;
            if (item.createdBy) {
                createdBy = item.createdBy.firstName;
            } else {
                createdBy = item.createdById;
            }
            if (item.inUse) {
                status = '<i class="fa fa-bolt"></i>';
            }
            var page_number = Math.ceil(index_record[index] / recordsPerPage);
            $('#occ_prime table tbody').append('<tr><td class="custom-center">' + status + '</td>' +
                                               '<td style="max-width: 290px;">' + item.name + '</td>' +
                                               '<td>' + item.repositoryId + '</td>' +
                                               '<td>' + createdBy + '</td>' +
                                               '<td><a style="cursor:pointer" class="td-xpt-compasso">'+ page_number +'</a></td></tr>');
            $('#occ_prime table td.custom-center').css('text-align', ' center');

        });

        function goToPage(number) {
            $('#cc-extensionIDs-table-paging-control_nav_input').val(number).trigger('blur');
        };

        $('.td-xpt-compasso').click(function (event) {
            goToPage($(this).text());

        });
    }

})();