import React, { useState, useEffect } from 'react';
import ChatBot from 'react-simple-chatbot';
import axios from 'axios';
import Draggable from 'react-draggable'; // Draggable을 import합니다.

import './chatbot.css';
// const BASE_URL = 'http://localhost:8080';
const BASE_URL = 'https://api.tripbridge.co.kr';

const Chatbot = () => {
  const [locations, setLocations] = useState([]);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const userToken = sessionStorage.getItem('accessToken');
        if (!userToken) {
          throw new Error('유저를 찾을 수 없습니다');
        }
        const response = await axios.get(`${BASE_URL}/scrap`, {
          headers: {
            Authorization: `Bearer ${userToken}`
          }
        });
        setLocations(response.data);
      } catch (error) {
        console.error('위치 데이터를 불러오는데 오류가 발생했습니다:', error);
      }
    };

    fetchLocations();
  }, []);

  useEffect(() => {
    console.log('옵션:', locations.map(location => ({
      value: location.place,
      label: location.place,
      trigger: '3',
    })));
  }, [locations]);

  const Answer = ({ previousStep, triggerNextStep }) => {
    const [message1, setMessage1] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      const fetchData = async () => {
        console.log("ANSWER ", previousStep.value);
        const previousValue = previousStep.value;
        try {
          const response = await axios.post(`${BASE_URL}/chatBot/question1`, {
            choicePlace: previousValue
          });
          const data = response.data;
          console.log('Data from backend:', data);
          setMessage1(data);
          setLoading(false);
          triggerNextStep();
        } catch (error) {
          console.error('Error sending data to backend:', error);
          setLoading(false);
        }
      };

      fetchData();
    }, [previousStep.value, triggerNextStep]);

    return (
      <div className={`message ${loading ? 'loading' : ''}`}>
        {loading
          ? 'Loading...'
          : message1.split('\n').map((line, index) => (
              <span key={index}>
                {line}
                <br />
              </span>
            ))}
      </div>
    );
  };

  const Answer2 = ({ previousStep, triggerNextStep }) => {
    const [message2, setMessage2] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      const fetchData = async () => {
        console.log("ANSWER 2", previousStep.value);
        const previousValue = previousStep.value;
        try {
          const response = await axios.post(`${BASE_URL}/chatBot/question2`, {
            choicePlace: previousValue
          });
          const data = response.data;
          console.log('Data from backend:', data);
          setMessage2(data);
          setLoading(false);
          triggerNextStep();
        } catch (error) {
          console.error('Error sending data to backend:', error);
          setLoading(false);
        }
      };

      fetchData();
    }, [previousStep.value, triggerNextStep]);

    return (
      <div className={`message ${loading ? 'loading' : ''}`}>
        {loading
          ? 'Loading...'
          : message2.split('\n').map((line, index) => (
              <span key={index}>
                {line}
                <br />
              </span>
            ))}
      </div>
    );
  };

  const Answer3 = ({ previousStep, triggerNextStep }) => {
    const [message3, setMessage3] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      const fetchData = async () => {
        console.log("ANSWER 3", previousStep.value);
        try {
          const userToken = sessionStorage.getItem('accessToken');
          const response = await axios.get(`${BASE_URL}/chatBot/question3`, {
            headers: {
              Authorization: `Bearer ${userToken}`
            },
          });
          const data = response.data;
          console.log('Data from backend:', data);
          setMessage3(data);
          setLoading(false);
          triggerNextStep();
        } catch (error) {
          console.error('Error sending data to backend:', error);
          setLoading(false);
        }
      };

      fetchData();
    }, [previousStep.value, triggerNextStep]);

    return (
      <div className={`message ${loading ? 'loading' : ''}`}>
        {loading
          ? 'Loading...'
          : message3.split('\n').map((line, index) => (
              <span key={index}>
                {line}
                <br />
              </span>
            ))}
      </div>
    );
  };

  const Answer4 = ({ previousStep, triggerNextStep }) => {
    const [message4, setMessage4] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      const fetchData = async () => {
        console.log("ANSWER4 ", previousStep.value);
        const previousValue = previousStep.value;
        try {
          const userToken = sessionStorage.getItem('accessToken');
          const response = await axios.post(`${BASE_URL}/chatBot/question4`, {
            schedule: previousValue
          }, {
            headers: {
              Authorization: `Bearer ${userToken}`
            }
          });
          const data = response.data;
          console.log('Data from backend:', data);
          setMessage4(data);
          setLoading(false);
          triggerNextStep();
        } catch (error) {
          console.error('Error sending data to backend:', error);
          setLoading(false);
        }
      };

      fetchData();
    }, [previousStep.value, triggerNextStep]);

    return (
      <div className={`message ${loading ? 'loading' : ''}`}>
        {loading
          ? 'Loading...'
          : message4.split('\n').map((line, index) => (
              <span key={index}>
                {line}
                <br />
              </span>
            ))}
      </div>
    );
  };

  const steps = [
    {
      id: '1',
      message: '안녕하세요!',
      trigger: 'ment1',
    },
    {
      id: 'ment1',
      message: '다음의 질문을 활용하여 여행을 즐겨보세요! (3,4번은 동선추천 기능을 이용한 후에 사용해주세요.)',
      trigger: '2',
    },
    {
      id: '2',
      options: [
        { value: '1', label: '1. 주변 관광지 추천', trigger: '3' },
        { value: '2', label: '2. 장소 이용 정보 안내', trigger: '4' },
        { value: '3', label: '3. 동선간의 이동 수단과 예상 비용', trigger: '5' },
        { value: '4', label: '4. 여행 동선에 따른 일정 추천', trigger: '6' },
        { value: '5', label: '5. 질문 끝내기', trigger: 'end' },
      ],
    },
    {
      id: '3',
      options: locations.map(location => ({
        value: location.place,
        label: location.place,
        trigger: '선택옵션1',
      })),
    },
    {
      id: '선택옵션1',
      component: <Answer />,
      waitAction: true,
      trigger: 'try',
    },
    {
      id: '4',
      options: locations.map(location => ({
        value: location.place,
        label: location.place,
        trigger: '선택옵션2'
      })),
    },
    {
      id: '선택옵션2',
      component: <Answer2 />,
      waitAction: true,
      trigger: 'try',
    },
    {
      id: '5',
      component: <Answer3 />,
      waitAction: true,
      trigger: 'try',
    },
    {
      id: '6',
      options: [
        { value: '1박 2일', label: '1박 2일', trigger: '선택옵션4' },
        { value: '2박 3일', label: '2박 3일', trigger: '선택옵션4' },
        { value: '3박 4일', label: '3박 4일', trigger: '선택옵션4' },
      ],
    },
    {
      id: '선택옵션4',
      component: <Answer4 />,
      waitAction: true,
      trigger: 'try',
    },
    {
      id: 'end',
      message: '질문을 마치겠습니다.',
      end: true,
    },
    {
      id: 'try',
      options: [{ value: '다시 질문 하기', label: '다시 질문 하기', trigger: '2' }],
    }
  ];

  return (
    <>
      {locations.length > 0 && (
        <Draggable bounds=".show-map-container">
          <div className="draggable-container custom-chatbot">
            <ChatBot
              steps={steps}
              className="custom-chatbot"
              headerTitle="Trip Bot"
              botAvatar="/chatbot/bot.png"
              hideUserAvatar
              placeholder="Join your Trip Bot"
              style={{
                width: '500px', // 원하는 너비로 지정
                height: 'auto', // 원하는 높이로 지정
              }}
            />
          </div>
        </Draggable>
      )}
    </>
  );
};

export default Chatbot;
