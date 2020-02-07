'use strict';
const querydata =`
{
  stopsByRadius(lat: 60.1694938, lon: 24.9263230, radius: 500) {
    edges {
      node {
        distance
        stop {
          platformCode
          vehicleMode
          name
          stoptimesWithoutPatterns (numberOfDepartures: 10, omitNonPickups: true){
            serviceDay
            scheduledArrival
            realtimeArrival
            arrivalDelay
            realtime
            trip {
              wheelchairAccessible
              gtfsId
              tripHeadsign
              routeShortName
            }
          }
        }
      }
    }
  }
}
`;
/*const queryNearestStops = `{
nearest(lat: 60.19915, lon: 24.94089, maxDistance: 500, filterByPlaceTypes: DEPARTURE_ROW) {
    edges {
      node {
        place {
          ...on DepartureRow {
            stop {
              lat
              lon
              name
            }
            stoptimes {
              serviceDay
              scheduledDeparture
              realtimeDeparture
              trip {
                route {
                  shortName
                  longName
                }
              }
              headsign
            }
          }
        }
        distance
      }
    }
  }
}
`
;*/
let walk = 1.5; // Walking speed m/s
const loadPage =()=>{

    fetch('https://api.digitransit.fi/routing/v1/routers/hsl/index/graphql', {
        method: 'POST',
        headers: {"Content-Type": "application/graphql"},
        body: querydata
    }).
    then(vastaus => vastaus.json())
        .then((json) =>{
            console.log(json),
                sortData(json.data)
        }).catch(error => console.log(error));
};
const sortData = (Data) => {
    let route = [];
    let busStop, distance, vehicle, name ='';
    for(let e=0; e< Data.stopsByRadius.edges.length; e++) {
        busStop = Data.stopsByRadius.edges[e].node;
        distance = busStop.distance/100;
        vehicle = busStop.stop.vehicleMode;
        name = busStop.stop.name;
        for (let s=0; s< busStop.stop.stoptimesWithoutPatterns.length; s++) {
            let row = [];
            let tanaan = new Date();
            let saapuu = busStop.stop.stoptimesWithoutPatterns[s];
            row.scheduleArrival = new Date((saapuu.serviceDay+saapuu.scheduledArrival)*1000);
            row.realtimeArrival = new Date((saapuu.serviceDay+saapuu.realtimeArrival)*1000);
            row.scheduleHour = row.scheduleArrival.getHours();
            row.scheduleMinute = row.scheduleArrival.getMinutes();
            row.realHour = row.realtimeArrival.getHours();
            row.realMinute = row.realtimeArrival.getMinutes();
            row.delay = saapuu.arrivalDelay;
            row.realtime = saapuu.realtime;
            row.realState = saapuu.realtimeState;
            row.id = saapuu.trip.gtfsId;
            row.number = saapuu.trip.routeShortName;
            row.heading = saapuu.trip.tripHeadsign;

            row.distance = distance;

            row.vehicle = vehicle;
            row.name = name;
            row.walkingTime = row.distance/walk*1000;
            row.timeUntil = (row.realtimeArrival-row.walkingTime-tanaan)/60000;

            if (route.findIndex(x => x.id === row.id)>=0) {break;}
            if (row.timeUntil<0) {break;}
            route.push(row);
        }
    }
    route.sort((a, b) => a.scheduleArrival - b.scheduleArrival);
    renderData(route);
};

const renderData = (Data) => {
    let show= document.getElementById('queryresults');
    let actualTime= new Date();
    while (show.firstChild){
        show.removeChild(show.firstChild);
    }
    let tablerow="";
    for(let oneRoute=0; oneRoute< 15; oneRoute++) {
        let real="", blink="", showTxt = "", late, hide, vehicle, whichVehicle;
        let row = Data[oneRoute];

        if (row.scheduleMinute<10) {row.scheduleMinute = "0"+row.scheduleMinute.toString()}
        if (row.scheduleHour<10) {row.scheduleHour = "0"+row.scheduleHour.toString()}
        if (row.realMinute<10) {row.realMinute = "0"+row.realMinute.toString()}
        if (row.realHour<10) {row.realHour = "0"+row.realHour.toString()}

        let scheduleTime = row.scheduleHour+":"+row.scheduleMinute;
        let realTime = row.realHour+":"+row.realMinute;

        if (row.delay>60) {late=`  </span><span class="late">${realTime}</span>`;hide="hide";}
        else if (row.delay<-30) {late=`  </span><span class="early">${realTime}</span>`;hide="hide";}
        else {late="</span>";hide="";}
        real = row.realtime?"online":"offline";

        if (0) {if (row.timeUntil<0) {blink ="soon";}}

        if (row.vehicle==="BUS") {vehicle = `bus</span>`; whichVehicle="bus";}
        else if (row.vehicle==="TRAM"){vehicle = `tram</span>`; whichVehicle="tram";}
        else {vehicle="</span>"; whichVehicle="";}

        row.distance = Number(Math.round(row.distance+'e1')+'e-1')*100;
        showTxt += `<tr class='row ${blink}'>`;

        showTxt += `<td><span class="${hide}">${scheduleTime}${late}</td>`;
        showTxt += `<td class="number heading"><span class="${whichVehicle}">${vehicle} ${row.number}</td>`;
        showTxt += `<td>${row.heading}</td>`;
        showTxt += `<td>${row.name}</td>`;
        showTxt += `<td class="responsive-walkingtime">${row.distance} m</td>`;

        showTxt +="</tr>";
        tablerow += showTxt;

    }
    show.innerHTML += tablerow;
};


loadPage();

let reload =  setInterval(loadPage, 30*1000);