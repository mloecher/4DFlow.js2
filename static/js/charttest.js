google.load('visualization', '1', {
    packages: ['corechart']
});
google.setOnLoadCallback(drawChart);

function drawChart() {

    var data = new google.visualization.DataTable();
    data.addColumn('number', 'time (ms)');
    data.addColumn('number', 'flow (mL/s)');

    data.addRows([
        [0, 0],
        [1, 10],
        [2, 23],
        [3, 17],
        [4, 18],
        [5, 9],
        [6, 11],
        [7, 27],
        [8, 33],
        [9, 40],
        [10, 32],
        [11, 35],
        [12, 30],
        [13, 40],
        [14, 42],
        [15, 47],
        [16, 44],
        [17, 48],
        [18, 52],
        [19, 54],
        [20, 42],
        [21, 55],
        [22, 56],
        [23, 57],
        [24, 60]
    ]);

    var options = {
        width: 500,
        height: 300,
        hAxis: {
            title: 'time (ms)',
            baselineColor: '#AAA',
            titleTextStyle: {
                color: '#AAA',
                font: 'Roboto',
                italic: false,
            },
            textStyle: {
                color: '#AAA',
                font: 'Roboto',
                italic: false,
            },
            gridlines: {
                color: '#777',
                count: 24,
            },
        },

        vAxis: {
            title: 'flow (mL/s)',
            baselineColor: '#AAA',
            titleTextStyle: {
                color: '#AAA',
                font: 'Roboto',
                italic: false,
            },
            textStyle: {
                color: '#AAA',
                font: 'Roboto',
                italic: false,
            },
            gridlines: {
                color: '#777',
                count: -1,
            },
        },
        chartArea: { 
            top: 20,
            left: 60,
            'width': '85%', 
            'height': '80%'
        },
        legend: {position: 'none'},
        backgroundColor: '#333333',
        colors: ['#F00'],
    };

    var chart = new google.visualization.LineChart(
        document.getElementById('ex0'));

    chart.draw(data, options);

}