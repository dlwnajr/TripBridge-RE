import React, { useState, useEffect } from 'react';
import './review.css';

function Review() {
  const [routes, setRoutes] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formValues, setFormValues] = useState({
    name: '',
    rate: '',
    comment: ''
  });

  const getToken = () => {
    return sessionStorage.getItem('accessToken');
  };

  const fetchRoutes = async () => {
    try {
      const token = getToken();
      const response = await fetch('http://3.35.115.71:8080/myroute/list', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error('네트워크 응답이 올바르지 않습니다.');
      }
      const data = await response.json();
      setRoutes(data);
    } catch (error) {
      console.error('동선 목록을 가져오는 중 오류 발생:', error);
    }
  };

  const fetchRouteDetails = async (routeId) => {
    if (!routeId) return;
    try {
      const token = getToken();
      const response = await fetch(`http://3.35.115.71:8080/myroute/${routeId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error('네트워크 응답이 올바르지 않습니다.');
      }
      const data = await response.json();
      setSelectedRoute(data);
      setFormValues({
        name: data.name,
        rate: data.rate,
        comment: data.comment
      });
    } catch (error) {
      console.error('동선 세부 정보를 가져오는 중 오류 발생:', error);
    }
  };

  const updateRoute = async () => {
    if (!selectedRoute) return;
    try {
      const token = getToken();
      const response = await fetch(`http://3.35.115.71:8080/myroute/${selectedRoute.id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams(formValues)
      });
      if (!response.ok) {
        throw new Error('네트워크 응답이 올바르지 않습니다.');
      }
      const updatedRoute = await response.json();
      setSelectedRoute(updatedRoute);
      setEditMode(false);
    } catch (error) {
      console.error('동선 정보를 업데이트하는 중 오류 발생:', error);
    }
  };

  const deleteRoute = async (routeId) => {
    if (!routeId) return;
    try {
      const token = getToken();
      const response = await fetch(`http://3.35.115.71:8080/myroute/${routeId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error('네트워크 응답이 올바르지 않습니다.');
      }
      setRoutes(prevRoutes => prevRoutes.filter(route => route.id !== routeId));
      if (selectedRoute && selectedRoute.id === routeId) {
        setSelectedRoute(null);
      }
    } catch (error) {
      console.error('동선을 삭제하는 중 오류 발생:', error);
    }
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormValues(prevValues => ({
      ...prevValues,
      [name]: value
    }));
  };

  const handleStarClick = (rating) => {
    setFormValues(prevValues => ({
      ...prevValues,
      rate: rating
    }));
  };

  useEffect(() => {
    fetchRoutes();
  }, []);

  const renderStars = (rating) => {
    const stars = [1, 2, 3, 4, 5];
    return (
      <div className="stars-container">
        {stars.map(star => (
          <span
            key={star}
            className={`star ${rating >= star ? 'filled' : ''}`}
            onClick={() => handleStarClick(star)}
          >
            &#9733;
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="review-container">
      <div className="left-panel">
        <div className="route-header">내 동선 목록</div>
        <div className="route-list">
          {routes.map(route => (
            <div key={route.id} onClick={() => fetchRouteDetails(route.id)} className="route-item-container">
              <div className="route-item">{route.name}</div>
              <button className="route-delete-button" onClick={(e) => {
                e.stopPropagation(); // Prevents the click event from bubbling up to the route item
                deleteRoute(route.id);
              }}>
                삭제
              </button>
            </div>
          ))}
        </div>
      </div>
      <div className="right-panel">
  {selectedRoute ? (
    <div className="route-content">
      <div className="route-title">
        {editMode ? (
          <input
            type="text"
            name="name"
            value={formValues.name}
            onChange={handleInputChange}
            className="route-input"
          />
        ) : (
          selectedRoute.name
        )}
      </div>
      <div className="places-section">
        <div className="places-list">
          <div className="places">
            {selectedRoute.myPlaces.length > 0 ? (
              selectedRoute.myPlaces.map((place, index) => (
                <div key={place.id} className="place-item">
                  <span className="place-number">{index + 1}</span>
                  <div className="place-content">{place.place}</div>
                </div>
              ))
            ) : (
              <div className="place-item">장소가 없습니다.</div>
            )}
          </div>
        </div>
        <div className="route-review">
          {editMode ? (
            <>
              <div className="rating">
                <label htmlFor="rate" className="rating-label">평점</label>
                {renderStars(formValues.rate)}
              </div>
              <div className="memo">
                <label htmlFor="comment" className="memo-label">메모</label>
                <textarea
                  id="comment"
                  name="comment"
                  value={formValues.comment}
                  onChange={handleInputChange}
                  className="route-input2 memo-textarea"
                />
              </div>
              <button className="comment-button" onClick={updateRoute}>저장</button>
            </>
          ) : (
            <>
              <div className="rating">
                <div className="rating-label">평점</div>
                <div className="rating-value">
                  {selectedRoute.rate ? renderStars(selectedRoute.rate) : <div className="star-placeholder">★★★★★</div>}
                </div>
              </div>
              <div className="memo">
                <div className="memo-label">메모</div>
                <div className="memo-content">
                  {selectedRoute.comment || <div className="memo-placeholder">코멘트를 입력해주세요.</div>}
                </div>
              </div>
            </>
          )}
          {/* Add the "수정" button here, outside the memo and rating sections */}
          {!editMode && (
            <button className="comment-button" onClick={() => setEditMode(true)}>수정</button>
          )}
        </div>
      </div>
    </div>
  ) : (
    <div className="no-selection">동선을 선택해주세요.</div>
  )}
</div>

    </div>
  );
}

export default Review;
