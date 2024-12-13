import React, { useState } from 'react';
import './signup.css';
import { signup } from '../../../api/user';
import { useNavigate } from 'react-router-dom';

const SignUp = () => {
  const [formData, setFormData] = useState({
    name: '',
    nickname: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm(formData);
    
    // Check if both checkboxes are selected
    const checkboxes = document.querySelectorAll('.required');
    const checked = Array.from(checkboxes).every(checkbox => checkbox.checked);
    
    if (Object.keys(validationErrors).length === 0 && checked) {
      try {
        const response = await signup({
          name: formData.name,
          nickname: formData.nickname,
          email: formData.email,
          password: formData.password,
          pw_check: formData.confirmPassword,
          alarm: '1',
          alarm2: '1'
        });
        console.log('회원가입 결과:', response);
        if (response.result === true) {
          console.log('회원가입 성공!');
          navigate('/login');
        } else {
          if (response.message === "중복된 Email 입니다.") {
            console.log('이메일 중복');
            setPopupMessage('중복된 이메일입니다!');
            setShowPopup(true);
          } else if (response.message === "중복된 Nickname 입니다.") {
            console.log('닉네임 중복');
            setPopupMessage('중복된 닉네임입니다!');
            setShowPopup(true);
          }
        }
      } catch (error) {
        console.error('회원가입 실패:', error);
        setShowPopup(true);
        setPopupMessage('서버 오류가 발생했습니다.');
      }
    } else {
      setErrors(validationErrors);
      // Scroll to the checkbox section to make it visible
      document.querySelector('.agreement-label').scrollIntoView({ behavior: 'smooth' });
      // Check if both checkboxes are not selected
      if (!checked) {
        setErrors(prevErrors => ({
          ...prevErrors,
          confirmCheckbox: '약관 동의는 필수입니다.'
        }));
      }
    }
  };

  const validateForm = (formData) => {
    let errors = {};

    if (!formData.name.trim()) {
      errors.name = '이름을 입력하세요.';
    }
    if (!formData.nickname.trim()) {
      errors.nickname = '닉네임을 입력하세요.';
    }
    if (!formData.email.trim()) {
      errors.email = '이메일 주소를 입력하세요.';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = '유효한 이메일 주소를 입력하세요.';
    }
    if (formData.password.length < 4) {
      errors.password = '비밀번호는 최소 4자 이상이어야 합니다.';
    }
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = '비밀번호가 일치하지 않습니다.';
    }

    return errors;
  };

  const handleClosePopup = () => {
    setShowPopup(false);
  };

  return (
    <div className="signup-background">
      <div className="signup-container">
        <div className="signup-title">회원가입</div>
        <div className='signup-message'>회원가입 후 Trip Bridge의 서비스를 이용해보세요.</div>
        <form onSubmit={handleSubmit}>
          <div className="signup-label">이름</div>
          <div className="signup-inputs">
          <input
            className={`signup-input ${errors.name && 'error'}`}
            placeholder='성함을 입력해주세요.'
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
          {errors.name && <span className="styled-error">{errors.name}</span>}
          </div>
          <div className="signup-label">닉네임</div>
          <div className="signup-inputs">
          <input
            className={`signup-input ${errors.nickname && 'error'}`}
            placeholder='닉네임을 입력해주세요.'
            type="text"
            name="nickname"
            value={formData.nickname}
            onChange={handleChange}
            required
          />
          {errors.nickname && <span className="styled-error">{errors.nickname}</span>}
          </div>
          <div className="signup-label">이메일 주소</div>
          <div className="signup-inputs">
          <input
            className={`signup-input ${errors.email && 'error'}`}
            placeholder='이메일 주소를 입력해주세요.'
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          {errors.email && <span className="styled-error">{errors.email}</span>}
          </div>
          <div className="signup-label">비밀번호</div>
          <div className="signup-inputs">
          <input
            className={`signup-input ${errors.password && 'error'}`}
            placeholder='비밀번호를 입력해주세요.'
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          {errors.password && <span className="styled-error">{errors.password}</span>}
          </div>
          <div className="signup-label">비밀번호 확인</div>
          <div className="signup-inputs">
          <input
            className={`signup-input ${errors.confirmPassword && 'error'}`}
            placeholder='비밀번호를 다시 입력해주세요'
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />
          {errors.confirmPassword && <span className="styled-error">{errors.confirmPassword}</span>}
          </div>
          {/* 약관동의 추가 */}
        <div className="agreement-divider"></div>
          <div className="agreement-label">약관 동의</div>
            <ul className="terms_list">
              <li className="terms_box">
                <input type="checkbox" className="required" id="termsOfService" />
                <label htmlFor="termsOfService">
                  Trip Bridge 이용약관 동의
                  <div className="tooltip">
                    <button className="info-button">?</button>
                     <div className="tooltip-text">
                      여러분을 환영합니다.<br/>Trip Bridge 서비스 및 제품(이하 ‘서비스’)을 이용해 주셔서 감사합니다.<br/>본 약관은 다양한 JUN 서비스의 이용과 관련하여 Trip Bridge 서비스를 제공하는 Trip Bridge 주식회사(이하 ‘Trip Bridge’)와 이를 이용하는 Trip Bridge 서비스 회원(이하 ‘회원’) 또는 비회원과의 관계를 설명하며, 아울러 여러분의 Trip Bridge 서비스 이용에 도움이 될 수 있는 유익한 정보를 포함하고 있습니다.
                    </div>
                  </div>
                </label>
              </li>
              <li className="terms__box">
                <input type="checkbox" className="required" id="personalInfo" />
                <label htmlFor="personalInfo">
                  개인정보 수집 및 이용 동의
                  <div className="tooltip">
                    <button className="info-button">?</button>
                    <div className="tooltip-text">
                        개인정보 보호법에 따라, Trip Bridge에 회원가입을 신청하시는 분들께 수집하는 개인정보의 항목, 이용 목적, 보유 기간, 동의 거부권 및 동의 거부 시 불이익에 대한 사항을 안내드립니다. 자세히 읽으신 후 동의해 주시기 바랍니다.
                    </div>
                  </div>
                </label>
              </li>
            </ul>

          {/* Checkbox error message */}
          {errors.confirmCheckbox && <span className="styled-error">{errors.confirmCheckbox}</span>}
          <div className="signup-button-container">
            <button className="signup-styled-button" type="submit">
              회원가입
            </button>
          </div>
        </form>
        {showPopup && (
          <div className="popup-overlay">
            <div className="popup">
              <div className="popup-content">
                <p>{popupMessage}</p>
                <button onClick={handleClosePopup}>확인</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SignUp;
