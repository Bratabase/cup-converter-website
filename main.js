var api = BratabaseAPI();

function populateBrands(elm, brands) {
    var opts = brands.map(function(brandTup){
        return $('<option value="'+ brandTup.href +'">').text(brandTup.name);
    })
    elm
        .empty()
        .append($('<option value="">').text("Pick a brand"))
        .append(opts);
}

function buildRow(pair) {
    var row = $('<tr>');
    row.append($('<td>').text(pair[0]));
    row.append($('<td>').text(pair[1]));
    row.append($('<td>').text(pair[2]));
    return row;
}

var CupConverter = {
    init: function(api){
        this.api = api;
        this.rightSelect = $('#right-brand');
        this.leftSelect = $('#left-brand');
        this.cupsTable = $('#cups-table');
        this.bandsTable = $('#bands-table');
        this.bratabaseLink = $('#bratabase-link');
        var self = this;
        api.root().then(function(root){
            root.links.brands().then(function(brands){
                populateBrands(self.leftSelect, brands.collection);
                populateBrands(self.rightSelect, brands.collection);
            });
        });
        this.bindEvents();
    },
    bindEvents: function(){
        var self = this;
        this.leftSelect.on('change', function(){
            if (self.rightSelect.val()){
                self.compareBrands();
            }
        });
        this.rightSelect.on('change', function(){
            if (self.leftSelect.val()){
                self.compareBrands().then(function(comparison){
                    self.buildTable(comparison.body);
                });
            }
        });
    },
    buildTable: function(comparison){
        var cups = comparison.cups;
        var bands = comparison.bands;
        var brandNames = [
            this.leftSelect.find('option:selected').text(),
            this.rightSelect.find('option:selected').text()
        ]
        var cupHead = $('<tr>');
        cupHead.append($('<th>').text('Cup'));
        cupHead.append($('<th>').text(brandNames[0]));
        cupHead.append($('<th>').text(brandNames[1]));
        var cupRows = _.union([cupHead], _.zip(cups.all_indexes, cups.brand_1, cups.brand_2).map(function(pair){
            return buildRow(pair);
        }));

        var bandHead = $('<tr>');
        bandHead.append($('<th>').text('Band'));
        bandHead.append($('<th>').text(brandNames[0]));
        bandHead.append($('<th>').text(brandNames[1]));
        var bandRows = _.union([bandHead], _.zip(bands.all_bands, bands.brand_1, bands.brand_2).map(function(pair){
            return buildRow(pair);
        }));

        this.cupsTable.empty().append(cupRows);
        this.bandsTable.empty().append(bandRows);
        this.bratabaseLink.attr('href', comparison.bratabase_url);
    },
    compareBrands: function(){
        var leftBrandUrl = this.leftSelect.val();
        var rightBrandUrl = this.rightSelect.val();
        return this.api.get(leftBrandUrl).then(function(leftBrand){
            return leftBrand.links.sizing().then(function(sizing){
                return sizing.links.compare({
                    brand: rightBrandUrl
                });
            });
        });
    }
}


var converter = CupConverter.init(api);
