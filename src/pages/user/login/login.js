import React, { useState } from 'react';
import './login.css';
import { login } from '../../../api/user';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';

const Login = ({ setIsLoggedIn, setNickname }) => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: '' });
    setErrorMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm(formData);
    if (Object.keys(validationErrors).length === 0) {
      try {
        const userData = await login(formData);
        setIsLoggedIn(true);
        setNickname(userData.data.nickname);
        sessionStorage.setItem('accessToken', userData.data.accessToken);
        sessionStorage.setItem('nickname', userData.data.nickname);
        navigate('/');
      } catch (error) {
        setErrorMessage('로그인에 실패했습니다. 이메일 주소 또는 비밀번호를 확인하세요.');
      }
    } else {
      setErrors(validationErrors);
    }
  };

  const validateForm = ({ email, password }) => {
    const errors = {};
    if (!email.trim()) errors.email = '이메일 주소를 입력하세요.';
    else if (!/\S+@\S+\.\S+/.test(email)) errors.email = '유효한 이메일 주소를 입력하세요.';
    if (password.length < 3) errors.password = '비밀번호는 최소 4자 이상이어야 합니다.';
    return errors;
  };

  return (
    <div className="login-background"> 
      <div className="login-container">
        <div className="login-title">로그인</div>
        <div className='login-message'>가입하신 이메일 주소로 로그인하세요.</div>
        <form onSubmit={handleSubmit}>
          <input
            className={`login-input ${errors.email && 'error'}`}
            placeholder='이메일 주소를 입력해주세요.'
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          {errors.email && <span className="styled-error">{errors.email}</span>}
          
          <input
            className={`login-input ${errors.password && 'error'}`}
            placeholder='비밀번호를 입력해주세요.'
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          {errors.password && <span className="styled-error">{errors.password}</span>}
          {errorMessage && <span className="styled-error">{errorMessage}</span>}

          <div className="login-button-container">
            <button className="login-button" type="submit">로그인</button>
          </div>
        </form>

        <div className="signup-prompt">
          <div className='signup-go'>아직 회원이 아니신가요? <Link className="signup-link" to="/signup"> 회원가입</Link></div>
        </div>
      </div>
    </div>
  );
};

export default Login;
