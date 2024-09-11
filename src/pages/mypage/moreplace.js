import React, { useEffect, useState, useRef } from 'react';
import { fetchLocations } from '../../api/kakaomap';
import { BsBookmarkStar } from "react-icons/bs";
import { CgClose } from "react-icons/cg";
import { sendScrap, deleteScrap } from '../../api/filter';
import blackMarkerImageSrc from './img/marker.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';


import './moreplace.css';

function MorePlace() {
  const [locations, setLocations] = useState([]);
  const [selectedLocations, setSelectedLocations] = useState([]);
  const [nickname, setNickname] = useState('');
  const [showGuide, setShowGuide] = useState(false);
  const [map, setMap] = useState(null);
  const [placesService, setPlacesService] = useState(null);
  const [placeMarkers, setPlaceMarkers] = useState([]);
  const [showScrapedPopup, setShowScrapedPopup] = useState(false);
  const [showAlreadyScrapedPopup, setshowAlreadyScrapedPopup] = useState(false);
  const [clickedLocationMarker, setClickedLocationMarker] = useState(null);
  const [clickedLocationOverlay, setClickedLocationOverlay] = useState(null);
  const [showNoRecommendationsPopup, setShowNoRecommendationsPopup] = useState(false);
  const [searchResults, setSearchResults] = useState([]); // 검색 결과를 저장하는 state
  const [showMiniRecommendations, setShowMiniRecommendations] = useState(false); // 주변 관광지 추천을 위한 상태
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 100, y: 100 }); // 초기 위치 설정
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 }); // 마우스가 눌린 위치
  const [offsetStart, setOffsetStart] = useState({ x: 0, y: 0 }); // 드래그 시작 시 창의 위치
  const [selectedRecommendation, setSelectedRecommendation] = useState(null);
  const [markers, setMarkers] = useState([]);  // 모든 마커를 저장하는 상태
  const [showSelectPlacePopup, setShowSelectPlacePopup] = useState(false); // 팝업 상태 추가
  const [showNoPlacePopup, setshowNoPlacePopup] = useState(false); // 팝업 상태 추가

  useEffect(() => {
    const script = document.createElement('script');
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=29f03c7b54622c8d9a8c60c20cd7e7e0&autoload=false`;
    script.defer = true;
    
    script.onload = () => {
      if (typeof window.kakao !== 'undefined' && window.kakao.maps) {
        initMap();  // 맵 초기화 함수 실행
        setPlacesService(new window.kakao.maps.services.Places());
      } else {
        console.error('카카오맵 API가 로드되지 않았습니다.');
      }
    };
    
    script.onerror = () => {
      console.error('카카오맵 스크립트 로드 실패');
    };
    
    document.head.appendChild(script);
  
    return () => {
      document.head.removeChild(script);
      if (map) {
        placeMarkers.forEach(marker => marker.setMap(null));
      }
    };
  }, []);
  

  const initMap = () => {
    const container = document.getElementById('map');
    const options = {
      center: new window.kakao.maps.LatLng(37.5665, 126.9780),
      level: 3
    };
    const newMap = new window.kakao.maps.Map(container, options);
    setMap(newMap);
  };

  useEffect(() => {
    const storedNickname = sessionStorage.getItem('nickname');
    if (storedNickname) {
      setNickname(storedNickname);
      const sessionStorageValue = sessionStorage.getItem(`doNotShowGuide_${storedNickname}`);
      if (sessionStorageValue !== 'true') {
        setShowGuide(true);
      }
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchLocations();
        setLocations(data);
      } catch (error) {
        console.error('위치 데이터를 가져오는 중 오류 발생:', error);
      }
    };

    fetchData();
  }, []);

  const handleLocationClick = async (location) => {
    try {
      setShowNoRecommendationsPopup(false);
      if (!map || !placesService) {
        console.error("Map or PlacesService is not initialized yet.");
        return;
      }
  
      // Clear existing place markers
      placeMarkers.forEach(marker => marker.setMap(null));
      setPlaceMarkers([]);

      // **1. 기존 검은색 마커 제거하는 코드 추가**
      if (clickedLocationMarker) {
        clickedLocationMarker.setMap(null);  // 기존 검은색 마커 제거
      }
      if (clickedLocationOverlay) {
        clickedLocationOverlay.setMap(null);  // 기존 overlay 제거
      }
      // Create a custom marker icon for the clicked location (black marker)
      const blackMarkerImage = new window.kakao.maps.MarkerImage(
        blackMarkerImageSrc, // import한 이미지 사용
        new window.kakao.maps.Size(35, 35), // 이미지 크기 (40x40 픽셀)
        { offset: new window.kakao.maps.Point(20, 40) } // 마커 위치 오프셋
      );
  
      // Create a marker for the clicked location
      const newClickedLocationMarker = new window.kakao.maps.Marker({
        position: new window.kakao.maps.LatLng(location.latitude, location.longitude),
        map: map,
        image: blackMarkerImage,
      });
  
      // **2. 새 검은색 마커를 상태에 저장하는 코드 추가**
      setClickedLocationMarker(newClickedLocationMarker);
  
      // Create CustomOverlay for the clicked location
      // 커스텀 오버레이 생성
const overlayContentAuto = `
<div style="
    padding: 5px 10px;
    background-color: #fff;
    border : 2px solid #ccc;
    border-radius: 10px;
    box-shadow: 0px 2px 10px rgba(0,0,0,0.2);
    font-family: 'Noto Sans KR', sans-serif;
    font-size: 14px;
    letter-spacing: 1px;">
  ${location.place}
</div>
`;

const newClickedLocationOverlay = new window.kakao.maps.CustomOverlay({
  position: new window.kakao.maps.LatLng(location.latitude, location.longitude), // 위치 설정
  content: overlayContentAuto, // 오버레이에 표시할 HTML 내용
  yAnchor: 2.2,  // 마커 위에 표시되도록 조정
  xAnchor: 0.5,  // 중앙 맞춤
  map: map // 오버레이를 표시할 지도 객체
});

setClickedLocationOverlay(newClickedLocationOverlay);  // 새로운 overlay 저장


  
      // Use location address to search for places (recommendations)
      const keyword = `${location.address} 관광지`;
      placesService.keywordSearch(keyword, async (result, status) => {
        if (status === window.kakao.maps.services.Status.OK) {
          setSearchResults(result); // **검색 결과를 저장**
          const newMarkers = result.map(place => {
            const markerPosition = new window.kakao.maps.LatLng(place.y, place.x);
            const marker = new window.kakao.maps.Marker({
              position: markerPosition,
              map: map,
            });
      
            let isOverlayVisible = false;  // 오버레이가 보이는지 여부를 저장하는 변수
            let customOverlay = null;      // 현재 오버레이를 저장할 변수
      
            // 마커 클릭 이벤트 등록
            window.kakao.maps.event.addListener(marker, 'click', () => {
              if (isOverlayVisible && customOverlay) {
                // 오버레이가 보일 때는 숨기기
                customOverlay.setMap(null);
                isOverlayVisible = false;
              } else {
                // 기존에 띄워진 CustomOverlay 제거
                if (window.currentOverlay) {
                  window.currentOverlay.setMap(null);
                }
      
                // CustomOverlay용 HTML content 생성 (스크랩 버튼 포함)
                const overlayContent = `
                  <div style="
                    padding: 5px 10px;
                    background-color: #fff;
                    border : 2px solid #ccc;
                    border-radius: 10px;
                    box-shadow: 0px 2px 10px rgba(0,0,0,0.2);
                    font-family: 'Noto Sans KR', sans-serif;
                    font-size: 14px;
                    letter-spacing: 1px;">
                    <i class="fa-regular fa-bookmark" style="margin-right:5px; cursor: pointer;" data-place-id="${place.id}"></i>
                    ${place.place_name}
                    
                  </div>
                `;
      
                // CustomOverlay 생성 (마커 클릭 시에만 나타나게 설정)
                customOverlay = new window.kakao.maps.CustomOverlay({
                  position: markerPosition,
                  content: overlayContent,
                  yAnchor: 2.2, // 위치 조정
                  xAnchor: 0.5,
                  map: map,
                });
      
                // 현재 표시된 CustomOverlay 저장하여 클릭 시 다른 오버레이 제거 가능
                window.currentOverlay = customOverlay;
      
                isOverlayVisible = true;  // 오버레이가 표시되었음을 기록
      
                // 스크랩 아이콘 클릭 이벤트 추가
                setTimeout(() => {
                  const icon = document.querySelector(`i[data-place-id="${place.id}"]`);
                  if (icon) {
                    icon.addEventListener('click', async () => {
                      console.log('스크랩 아이콘 클릭됨:', place.place_name);
      
                      const scrapData = {
                        place: place.place_name,
                        address: place.address_name,
                        longitude: place.x,
                        latitude: place.y,
                      };
      
                      try {
                        const response = await sendScrap(scrapData);
                        console.log('스크랩 성공:', response);
      
                        if (response.result) {
                          // 스크랩 성공 시 로직 처리
                          const updatedScrapData = {
                            ...scrapData,
                            id: response.data.id,
                          };
                          setLocations(prevLocations => [...prevLocations, updatedScrapData]);
                          setShowScrapedPopup(true);
                        } else {
                          throw new Error('스크랩 실패');
                        }
                      } catch (error) {
                        console.error('스크랩 에러:', error);
                        setshowAlreadyScrapedPopup(true);
                        
                      }
                    });
                  }
                }, 0);
              }
            });
      
            return marker;
          });

          setMarkers(newMarkers);  // 생성된 마커들을 상태에 저장
      
          // 마커 및 오버레이 표시 관련 처리
          setPlaceMarkers(prevMarkers => [...prevMarkers, ...newMarkers]);
      
          if (newMarkers.length > 0) {
            const bounds = new window.kakao.maps.LatLngBounds();
            newMarkers.forEach(marker => bounds.extend(marker.getPosition()));
            map.setBounds(bounds);
          }
        } else {
          console.error('장소 검색 실패:', status);
          setSearchResults([]); // 검색 결과 상태를 초기화
          setShowNoRecommendationsPopup(true); // "주변 추천 장소가 없습니다" 팝업 띄우기
          setShowMiniRecommendations(false); // 주변 관광지 추천 창 닫기
          removeCurrentOverlay(); // 오버레이 제거
        }
      });
  
      setSelectedLocations([location]);
    } catch (error) {
      console.error('An error occurred while processing the location click:', error);
    }
};

  
  
  

  
  
const handleDeleteLocation = async (location) => {
  console.log('Deleting location:', location);

  if (!location || !location.id) {
    console.error('유효하지 않은 위치입니다.', location);
    return;
  }

  try {
    await deleteScrap(location.id);

    // 스크랩 목록에서 해당 위치 삭제
    setLocations(prevLocations =>
      prevLocations.filter(prevLocation => prevLocation.id !== location.id)
    );

    // 선택된 위치 목록에서도 해당 위치 삭제
    setSelectedLocations(prevLocations =>
      prevLocations.filter(prevLocation => prevLocation.id !== location.id)
    );

    // 지도에서 해당 위치의 마커만 삭제
    setPlaceMarkers(prevMarkers => {
      const markerToDelete = prevMarkers.find(marker => marker.id === location.id);
      if (markerToDelete) {
        markerToDelete.setMap(null); // 해당 마커만 지도에서 제거
      }
      return prevMarkers.filter(marker => marker.id !== location.id); // 해당 마커만 리스트에서 제거
    });

    console.log('스크랩이 삭제되었습니다.');
  } catch (error) {
    console.error('스크랩 삭제 중 오류 발생:', error);
  }
};

// 추천 리스트를 닫거나 장소가 없을 때 CustomOverlay를 제거하는 함수
const removeCurrentOverlay = () => {
  if (window.currentOverlay) {
    window.currentOverlay.setMap(null); // 현재 오버레이가 있으면 지도에서 제거
    window.currentOverlay = null; // 오버레이 상태 초기화
  }
};

// X 버튼 클릭 시 추천 리스트를 닫고 CustomOverlay도 제거
const toggleRecommendations = (event) => {
  removeCurrentOverlay(); // 오버레이 제거

  if (selectedLocations.length === 0) {
    setShowSelectPlacePopup(true); // 장소를 선택하라는 팝업 띄우기
  } else if (searchResults.length === 0) {
    setshowNoPlacePopup(true); // 추천 장소가 없을 때 다른 장소를 선택하라는 팝업 띄우기
  } else {
    const buttonRect = event.target.getBoundingClientRect(); // 버튼의 위치 정보 가져오기
    setPosition({
      x: buttonRect.left - 350, // 버튼의 왼쪽 좌표로 이동, 창 너비만큼 왼쪽으로 설정
      y: buttonRect.top + window.scrollY - 500, // 버튼과 같은 높이로 설정, 살짝 위로 올림
    });
    setShowMiniRecommendations(!showMiniRecommendations); // 추천 보기 창 토글
  }
};





// 마우스를 누를 때 드래그 시작
const handleMouseDown = (e) => {
  setIsDragging(true);
  setDragStart({
    x: e.clientX,
    y: e.clientY,
  });
  setOffsetStart({
    x: position.x,
    y: position.y,
  });
};

// 마우스를 움직일 때 창의 위치를 업데이트
const handleMouseMove = (e) => {
  if (isDragging) {
    const newX = offsetStart.x + (e.clientX - dragStart.x);
    const newY = offsetStart.y + (e.clientY - dragStart.y);
    setPosition({
      x: newX,
      y: newY,
    });
  }
};

// 마우스를 놓을 때 드래그 종료
const handleMouseUp = () => {
  setIsDragging(false);
};
  
const handleRecommendationClick = (place, index) => {
  // 마커를 클릭했을 때의 로직을 실행
  if (markers[index]) {
    const marker = markers[index];
    window.kakao.maps.event.trigger(marker, 'click');  // 마커의 클릭 이벤트 강제 트리거
  }

  setSelectedRecommendation(place);  // 선택된 장소를 상태로 저장하여 스타일 업데이트
};

  
  
  


  return (
    <div className="moreplace-container">
  <div className="place-boxes">
    <div className="place1-box">
      <div id="map" className="map"></div>
    </div>
    <div className="place2-box">
      <div className="more-scrap-container">
        <div className="more-scrap-title">
          <BsBookmarkStar />&nbsp;스크랩 목록
        </div>
        <ul className="more-scrap-list">
          {locations.map((location, index) => (
            <li
              key={index}
              onClick={() => handleLocationClick(location)}
              className={selectedLocations.includes(location) ? 'selected' : ''}
            >
              <strong>{location.place}</strong>
              <p>{location.address}</p>
              <CgClose
                className="delete-button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteLocation(location);
                }}
              />
            </li>
          ))}
        </ul>
      </div>
       {/* 리스트와 버튼을 분리된 div로 분리 */}
  <div className="recommendation-button-container">
    <button className="toggle-recommendation-button" onClick={toggleRecommendations}>
      주변 관광지 추천 리스트
    </button>
  </div>

    </div>
  </div>



     {/* 팝업 코드 추가 */}
    {showScrapedPopup && (
      <div className="more-popup-result">
        <div className="more-popup-inner1">
          <p>스크랩 되었습니다.</p>
          <button onClick={() => setShowScrapedPopup(false)}>확인</button>
        </div>
      </div>
    )}

    {/* Already Scraped Popup */}
    {showAlreadyScrapedPopup && (
        <div className="more-popup-result">
          <div className="more-popup-inner2">
            <p>이미 스크랩 된 장소입니다.</p>
            <button onClick={() => setshowAlreadyScrapedPopup(false)}>확인</button>
          </div>
        </div>
      )}

    {showNoRecommendationsPopup && (
      <div className="more-popup-result">
        <div className="more-popup-inner3">
          <p>주변 추천 장소가 없습니다!</p>
          <button onClick={() => setShowNoRecommendationsPopup(false)}>확인</button>
        </div>
      </div>
    )}
 
 
 {showMiniRecommendations && (
  <div
    className="mini-recommendation-window"
    style={{
      top: `${position.y}px`,
      left: `${position.x}px`, // Adjusted to position to the left of the button
      position: 'absolute',
      zIndex: 1000,
    }}
    onMouseDown={handleMouseDown} // 마우스를 누르면 드래그 시작
    onMouseMove={handleMouseMove} // 드래그 중일 때 창을 움직이게 하는 이벤트
    onMouseUp={handleMouseUp} // 마우스를 떼면 드래그 중지
  >
    <div className="mini-recommendation-header">
      <h3>주변 관광지 추천</h3>
      <button className="close-button" onClick={toggleRecommendations}>
        <FontAwesomeIcon icon={faTimes} size="sm" />
      </button>
    </div>
    <div className="mini-recommendation-list">
      {searchResults.length > 0 ? (
        searchResults.map((place, index) => (
          <div
            key={index}
            className={`recommendation-item ${selectedRecommendation === place ? 'selected' : ''}`}
            onClick={() => handleRecommendationClick(place, index)}  // 인덱스를 함께 전달
          >
            <strong>{place.place_name}</strong>
            <p>{place.address_name}</p>
          </div>
        ))
      ) : (
        <p>추천 관광지가 없습니다.</p>
      )}
    </div>
  </div>
)}



{showSelectPlacePopup && (
  <div className="more-selectpopup-overlay">
    <div className="more-selectpopup">
      <p>스크랩 목록에서 장소를 선택해주세요!</p>
      <button onClick={() => setShowSelectPlacePopup(false)}>확인</button>
    </div>
  </div>
)}


{showNoPlacePopup && (
  <div className="more-selectpopup-overlay">
    <div className="more-selectpopup">
      <p>스크랩 목록에서 다른 장소를 선택해주세요!</p>
      <button onClick={() => setshowNoPlacePopup(false)}>확인</button>
    </div>
  </div>
)}

    </div>

    

    
  );
}

export default MorePlace