import React, { useEffect, useRef } from 'react';
import './main.css';

const Main = () => {

  const features = [
    {
      title: "취향 저격! 나만의 완벽한 여행지 추천",
      content: "나에게 딱 맞는 여행지가 궁금하다면? \n 원하는 조건으로 추려진 곳들을 만나보세요.",
    },
    {
      title: "최적의 동선을 그리다. 편리한 여행 완성!",
      content: "여행 계획에 스트레스는 더이상 그만!\n카카오맵과 함께하는 스마트하게 동선 추천을 받아보세요.",
    },
    {
      title: "ChatGPT에게 물어봐",
      content: "저장한 장소와 여행 동선에 궁금한 점이 있으신가요? \n ChatGPT에게 물어보세요. 즉시 도움을 드립니다.",
    },    
    {
      title: "나만의 여정, 내 스타일로 기록하기",
      content: "추천받은 동선을 저장하고, 제목, 평점, 메모까지 남겨보세요.\n효율적인 여행 관리가 가능합니다!",
    },
    {
      title: "함께 나누는 여행 이야기!",
      content: "즐거움을 나누면 2배! \n자유롭게 소통하며 여행의 재미를 더해줄 커뮤니티 공간입니다.",
    },
  ];

  const featureRefs = useRef([]);

  useEffect(() => {
    const options = {
      root: null, // viewport
      rootMargin: '0px',
      threshold: 0.5, // 50%가 보이면 trigger
    };
  
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible'); // visible 클래스 추가
        } else {
          entry.target.classList.remove('visible'); // visible 클래스 제거
        }
      });
    }, options);
  
    featureRefs.current.forEach(card => {
      if (card) { // card가 유효할 때만 observe
        observer.observe(card);
      }
    });
  
    return () => {
      featureRefs.current.forEach(card => {
        if (card && document.body.contains(card)) { // DOM에 남아있다면 unobserve
          observer.unobserve(card);
        }
      });
    };
  }, []);
  
  
  return (
    <div className="main">
      {/* 배너 */}
      <div className="main-banner">
        <div className="main-title">TRIP BRIDGE</div>
        <div className="main-description">
          여행의 시작과 끝, Trip Bridge에서 나만의 여행을 만들어보세요! <br />
          여행 커뮤니티와 다양한 여행지 추천 그리고 나만의 동선 관리까지, 여러분의 잊지 못할 여정을 Trip Bridge가 함께 합니다.
        </div>
      </div>

      {/* 기능 소개 섹션 */}
          {/* 기능 소개 제목 및 카드 */}
          <div className="features-wrapper">
      <div className="features-semititle">✨Welcome!<br/><br/>주요 기능에 대해<br/>소개 합니다.</div>
      <div className="features-container">
        {features.map((feature, index) => (
          <div
            className="feature-card"
            key={index}
            data-index={index + 1 < 10 ? `0${index + 1}` : index + 1}
            ref={el => featureRefs.current[index] = el} // 각 카드의 ref 설정
          >
            <div className="feature-content">
              <div className="feature-title">{feature.title}</div>
              <div className="feature-description">
                {feature.content.split('\n').map((line, index) => (
                  <span key={index}>{line}</span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>

    <div className='process-container'>
      <div className='process-semititle'>
        어떻게 활용하나요?
      </div>
    </div>
    </div>
  );
};

export default Main;
