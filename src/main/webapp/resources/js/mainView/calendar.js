$(document).ready(function() {
	makeCalendar();
});

var point = new ol.layer.Tile({
	source: new ol.source.TileWMS({
		url: 'http://localhost:8080/geoserver/wms',
		params: {
			'LAYERS': 'clean_data',
			'TILED': true,
		},
		serverType: 'geoserver',
	})
});
var line = new ol.layer.Tile({
	source: new ol.source.TileWMS({
		url: 'http://localhost:8080/geoserver/wms',
		params: {
			'LAYERS': 'clean_line',
			'TILED': true,
		},
		serverType: 'geoserver',
	})
});
var start_point = new ol.layer.Tile({
	source: new ol.source.TileWMS({
		url: 'http://localhost:8080/geoserver/wms',
		params: {
			'LAYERS': 'start_point',
			'TILED': true,
		},
		serverType: 'geoserver',
	})
});
var end_point = new ol.layer.Tile({
	source: new ol.source.TileWMS({
		url: 'http://localhost:8080/geoserver/wms',
		params: {
			'LAYERS': 'end_point',
			'TILED': true,
		},
		serverType: 'geoserver',
	})
});



// ajax 자동차에 대한 날짜 데이터 배열에 저장
let nowDate = new Date();
const todayDate = new Date();
const CarCleanDate = new Array();

function arrayTest(data) {
	for (var i = 0; i < data.length; i++) {
		CarCleanDate[i] = data[i];
		makeCalendar();
	}
}


//  "<" 클릭시 다음달 view
function prevCalendar() {
	nowDate = new Date(nowDate.getFullYear(), nowDate.getMonth() - 1, nowDate.getDate());
	makeCalendar(); //달력 cell 만들어 출력 
}

//  ">" 클릭시 다음달 view
function nextCalendar() {
	nowDate = new Date(nowDate.getFullYear(), nowDate.getMonth() + 1, nowDate.getDate());
	makeCalendar();
}


//  달력 출력
function makeCalendar() {
	let doMonth = new Date(nowDate.getFullYear(), nowDate.getMonth(), 1);
	let lastDate = new Date(nowDate.getFullYear(), nowDate.getMonth() + 1, 0);

	const tbCalendar = document.getElementById("calendar");
	const tbCalendarYM = document.getElementById("tbCalendarYM");
	tbCalendarYM.innerHTML = nowDate.getFullYear() + "년 " + (nowDate.getMonth() + 1) + "월";

	while (tbCalendar.rows.length > 2) {
		tbCalendar.deleteRow(tbCalendar.rows.length - 1);
	}
	let row = null;
	row = tbCalendar.insertRow();
	let cnt = 0;
	for (i = 0; i < doMonth.getDay(); i++) {
		cell = row.insertCell();
		cnt = cnt + 1;
	}

	/*달력 출력*/
	for (i = 1; i <= lastDate.getDate(); i++) {
		cell = row.insertCell();
		cell.innerHTML = i;
		cell.classList.add('day');
		cnt = cnt + 1;
		if (cnt % 7 == 1) {

			cell.classList.add('text-danger');
			cell.innerHTML = i;

		}
		if (cnt % 7 == 0) {
			cell.classList.add('text-primary');
			cell.innerHTML = i;

			row = tbCalendar.insertRow();
		}

		for (let j = 0; j < CarCleanDate.length; j++) {
			let cleanDateString = CarCleanDate[j];
			let cleanDateObject = new Date(cleanDateString);

			if (
				nowDate.getFullYear() == cleanDateObject.getFullYear() &&
				nowDate.getMonth() == cleanDateObject.getMonth() &&
				i == cleanDateObject.getDate()
			) {
				cell.classList.add('selected');
			}
		};

		/*오늘의 날짜에 표시*/
		if (nowDate.getFullYear() == todayDate.getFullYear()
			&& nowDate.getMonth() == todayDate.getMonth()
			&& i == todayDate.getDate()) {

			cell.setAttribute('id', 'today');
		}
	}

	// 차량 선택시 해당 차량에대한 청소날짜 생성
	const carNumGroup = document.querySelector('#car_num');
	carNumGroup.addEventListener("change", function() {

		const carNum = carNumGroup.value;

		$.ajax({
			type: "GET",
			url: "/view/carNum", // 시작 요청을 보낼 엔드포인트 URL
			data: {
				carNum: carNum
			},
			dataType: "json",
			success: function(data) {
				arrayTest(data);
				deleteCleanData();
			}
		});
	})


	// 날짜 선택, 차량 선택시 view 화면 변경
	const selectedDates = document.querySelectorAll(".selected");
	selectedDates.forEach(selectedDate => {
		selectedDate.addEventListener('click', () => {

			const year = nowDate.getFullYear();
			const month = String(nowDate.getMonth() + 1).padStart(2, '0'); // 월을 2자리 문자열로 만듭니다.
			const date = String(selectedDate.innerHTML.padStart(2, '0'));
			const cleanDate = `${year}-${month}-${date}`;

			let carNumGroup = document.querySelector('#car_num');
			let carNum = carNumGroup.value;

			// 선택날짜 출력하기
			var viewparams = 'date:' + cleanDate + ';carNum:' + carNum;
			line.getSource().updateParams({ 'viewparams': viewparams });
			point.getSource().updateParams({ 'viewparams': viewparams });
			start_point.getSource().updateParams({ 'viewparams': viewparams });
			end_point.getSource().updateParams({ 'viewparams': viewparams });




			// 중심 좌표 이동
			let cleanTime = document.getElementById("clean-time");
			let cleanRatio = document.getElementById("clean-ratio");
			let totalDistance = document.getElementById("total-distance");
			let cleanDistance = document.getElementById("clean-distance");


			$.ajax({
				type: "GET",
				url: "/view/select?carNum=" + carNum + "&date=" + cleanDate, // 시작 요청을 보낼 엔드포인트 URL
				dataType: "json",
				success: function(data) {
					let lon = data.lon;
					let lat = data.lat;
					cleanTime.innerText = data.cleanTime;
					cleanRatio.innerText = data.cleanRatio + "%";
					totalDistance.innerText = data.totalDistance.toFixed(2) + "km";
					cleanDistance.innerText = data.cleanDistance.toFixed(2) + "km";
					
					deleteCleanData();
					addCleanData();
					
					map.getView().animate({
						center: ol.proj.transform([lon, lat], 'EPSG:4326', 'EPSG:3857'),
						zoom: 15,
						duration: 800
					});
				}, error: function(jqXHR, textStatus, errorThrown) {
					console.log(errorThrown);
					console.log(jqXHR);
					console.log(textStatus);
					console.log(cleanDate);
					console.log(carNum);
				}
			});

		});
	});
}

// 청소구역 레이어 삭제
function deleteCleanData() {
	map.removeLayer(line);
	map.removeLayer(point);
	map.removeLayer(start_point);
	map.removeLayer(end_point);
}

// 청소구역 레이어 추가
function addCleanData() {
	map.addLayer(line);
	map.addLayer(point);
	map.addLayer(start_point);
	map.addLayer(end_point);
}



