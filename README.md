Pupils in different Type of Schools in Cologne 
==============================================

Demo
------
http://www.ingrid-bluoss.de/schools


Motivation
-----------

A map and a bar chart show the distribution of pupils in schools accross stadtteile (city parts) in Cologne. There are several indicators to choose from:

* pupils in Haauptschule
* pupils in Realschule
* pupils in Gynasium
* Pupils in Gesamtschule

in Stadtteile
in Stadtbezirke
in left/right side of the River Rhine


Data
-----------
The data is from the webside of the city of cologne: www.offenedaten-koeln.de

2012 SchülerInnen Insgesamt
http://www.offenedaten-koeln.de/dataset/af19a938-2665-4608-8409-a57da35cda2a/resource/af19a938-2665-4608-8409-a57da35cda2a

2012 SchülerInnen Stadtbezirk
http://www.offenedaten-koeln.de/dataset/234a0bf2-9d41-41bd-bce8-20178af1bbbd/resource/234a0bf2-9d41-41bd-bce8-20178af1bbbd

2012 SchülerInnen Stadtteil
http://www.offenedaten-koeln.de/dataset/6828a383-f217-4a93-8c2f-b25c5df05994/resource/6828a383-f217-4a93-8c2f-b25c5df05994

* the Stadtteile overlay is loaded from a geoJSON description from here http://datacolonia.de/blog/ps-gefluester-koeln.html


Scripting
-----------
The Javascript is based on an Open Data Project from here 
https://github.com/yurukov/opendata-educ-map
* build event handlers and data update mechanism to link the Leaflet map and the d3 chart.


* built with Leaflet.js. 
* The bar chart, data and color handling is done with D3.js. 
