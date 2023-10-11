package com.gis.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import com.gis.dto.gis.DateCoord;
import com.gis.dto.gis.GpsTempData;
import com.gis.dto.gis.NoiseTempData;
import com.gis.dto.gis.RpmTempData;
import com.gis.dto.gis.Statistics;
import com.gis.service.gis.IGisService;
import com.gis.util.TimeScheduler;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

@Controller
@RequestMapping("/gis")
@RequiredArgsConstructor
@Log4j2
public class StartController {
	
	private final TimeScheduler timeScheduler;
	private final IGisService gisService;
	
    @GetMapping
    public String main() {
    	return "index";
    }
    @ResponseBody
    @GetMapping("/start")
    public String startScheduler(@RequestParam int time) {
    	timeScheduler.startScheduler(time);
        return "";
    }
    /**
	 * Car테이블에서 차량 번호 조회
	 * @author 여수한
	 */
    @ResponseBody
    @GetMapping("/car")
    public List<String> selectCar() {
    	List<String> carList = gisService.selectCar();
    	return carList;
    }
    @PostMapping("/temp/gps")
    public ResponseEntity<String> insertGpsTempData(@RequestBody GpsTempData locationDto) {
    	log.info("GPS : " + locationDto);
    	gisService.insertGpsTempData(locationDto);
    	return  new ResponseEntity<>("Success message", HttpStatus.OK);
    }
    @PostMapping("/temp/noise")
    public ResponseEntity<String>  insertNoiseTempData(@RequestBody NoiseTempData noiseDto) {
    	log.info("noise : " + noiseDto);
    	gisService.insertNoiseTempData(noiseDto);
    	return  new ResponseEntity<>("Success message", HttpStatus.OK);
    }
    @PostMapping("/temp/rpm")
    public ResponseEntity<String>  insertRpmTempData(@RequestBody RpmTempData vibrationDto) {
    	log.info("rpm : " + vibrationDto);
    	gisService.insertRpmTempData(vibrationDto);
    	return  new ResponseEntity<>("Success message", HttpStatus.OK);
    }
    @ResponseBody
    @GetMapping("/stop")
    public String stopScheduler() {
    	timeScheduler.stopScheduler();
        return "";
    }
    @ResponseBody
    @GetMapping("/statistics")
    public Statistics DateStatistics(@RequestBody String date, @RequestBody String carNum){
    	// 청소 시간
    	String DateCleanTime = gisService.selectDateCleanTime("2023-08-29", "103하2414");
    	// 청소 비율
    	double DateCleanRatio = gisService.selectDateCleanRatio("2023-08-29", "103하2414");
    	// 총 운행거리
    	double DateTotalDistance = gisService.selectDateTotalDistance("2023-08-29", "103하2414");
    	// 청소한 운행거리
    	double DateCleanDistance = gisService.selectDateCleanDistance("2023-08-30", "103하2414");
    	Statistics statistics = new Statistics();
    	statistics.setCleanTime(DateCleanTime);
    	statistics.setCleanDistance(DateCleanDistance);
    	statistics.setCleanRatio(DateCleanRatio);
    	statistics.setTotalDistance(DateTotalDistance);
    	return statistics;
    }
    @ResponseBody
    @GetMapping("/coord")
    public DateCoord DateCoord(@RequestBody String date, @RequestBody String carNum){
    	return gisService.selectDateCoord(date, carNum);
    }
}
