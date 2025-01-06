import styled, { keyframes, css } from 'styled-components';
import background from "../images/BACKGROUND.jpg"
import { darken } from 'polished';
export const Container = styled.div`
  width: 100%;
  height: 100vh;
  background-image: 
    linear-gradient(to left, #F0F7FF 50%, rgba(0, 0, 0, 0) 50%), 
    url(${background}); /* The background image */
  background-size: cover;
  background-position: center;

  @media (max-width: 768px) {
    background-image: 
      linear-gradient(to top, #F0F7FF 50%, rgba(0, 0, 0, 0) 50%), 
      url(${background}); /* Change the gradient direction for mobile */
  }
`;
export const  Logo=styled.img`
position: relative;
bottom:100px;

@media (max-width: 768px) {
  width:870px;
  position: relative;
bottom:150px;
right:120px;
  }
`
export const LeftContent = styled.div`
  position: absolute;
  top: 50%;
  right: 150px;
  transform: translateY(-50%); 
  color: #333; 
  font-size: 24px;

  @media (max-width: 768px) {
    top: 70%;
  right: 20px;
  transform: translateY(-50%); 
  color: #333; 
  font-size: 24px
  }
`;
export const LoginContainer=styled.div`

display:flex;
flex-direction:column;


`
export const LoginFields=styled.input`
background-color:#E6F7F7;
width:593px;
height:62px;
border-radius: 20px;
border-style: solid;
border-color: #2F8F9D;
border-width: 4px;
margin-bottom: 20px;
text-color:#BBBBBB;
font-size:14px;
font-weight:bold;

@media (max-width: 768px) {
  width:393px;
height:62px;
border-radius: 20px;
border-style: solid;
border-color: #2F8F9D;
border-width: 4px;
margin-bottom: 20px;
text-color:#BBBBBB;
font-size:14px;
font-weight:bold;
  }
`
export const LoginText=styled.h1`

text-align:center;
font-weight:bold;
`
export const LoginButton=styled.button`

background-color: rgba(67, 97, 238, 0.3686); 
box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
&:hover {
    background-color: ${darken(0.1, 'rgba(67, 97, 238, 0.3686)')}; /* Darken the color on hover */
  }
width:593px;
height:62px;
border-radius: 20px;
color:white;
font-size:24px;
text-align:center;

@media (max-width: 768px) {
  width:393px;
height:62px;

  }
`
export const Forgotten = styled.p`
  font-size: 14px;
  position: relative;
  left: 450px; 
  color: #4361EE;
  font-weight: bold;

  &:hover {
    color: #3656CC;
  }

  @media (max-width: 768px) {
    position: relative;
    left: 20px; 
    font-size: 12px; 
  }
`;