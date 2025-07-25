import styled from 'styled-components';
import background from "../images/BACKGROUND.jpg"
import { darken } from 'polished';
export const Container = styled.div`
  width: 100%;
  height: 100vh;
  background-image: 
    linear-gradient(to left, #F0F7FF 50%, rgba(0, 0, 0, 0) 50%), 
    url(${background});
  background-size: cover;
  background-position: center;

  @media (max-width: 768px) {
    background-image: 
      linear-gradient(to top, #F0F7FF 50%, rgba(0, 0, 0, 0) 50%), 
      url(${background});
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
    background-color: ${darken(0.1, 'rgba(67, 97, 238, 0.3686)')};
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

export const AdminDashboardDiv = styled.div`
  background-color: #D0DBE9;
  width: 100%;
  height: 100vh;
`;

export const SideBarContainer = styled.div`
  display: flex;
  flex-direction: column;
  position: fixed;
 bottom:350px;
  left: 0;
  height: 50vh;
  width: 250px;
  background-color: #80B5FA;
  padding: 20px;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
  border-radius: 0 10px 10px 0;
`;

export const SideBarItems = styled.div`
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-top: 20px;
`;

export const SideBarItem = styled.div`
  font-size: 18px;
  font-weight: bold;
  color: black;
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
`;

export const LogoutButton = styled.button`
  font-size: 18px;
  font-weight: bold;
  color: red;
  background: none;
  border: none;
  cursor: pointer;
  align-self: flex-start;

  &:hover {
    text-decoration: underline;
  }
`;
export const MainInput = styled.input`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -520%);
  display: flex;
  flex-direction: column;
  width:920px;
  height:50px;

  padding: 10px;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 5px;
`;
export const ChartContainer = styled.div`
  display: flex;
  flex-direction: row;
position:relative;
top:100px;
left:200px;

`;

export const MenuItemContainer = styled.div`
  display: flex;
  align-items: center;
  padding: 12px 25px;
  font-weight: 500;
  font-size:10px; 
  color: #2D3A56 !important;
  &:hover {
    background-color: #868dfb !important;
    color: black !important;
  }

  &.active {
    color: #6870fa !important;
  }
`;
export const SidebarContainer = styled.div`
  .pro-sidebar {
    background-color: #333 !important;
    color: white !important;
  }
`;

export const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

export const ModalContainer = styled.div`
  background-color: #FFFFFF;
  padding: 30px;
  border-radius: 10px;
  width: 400px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export const ModalTitle = styled.h2`
  color: #333;
  font-weight: bold;
  margin-bottom: 20px;
  font-size: 24px;
`;

export const ModalMessage = styled.p`
  color: #555;
  font-size: 16px;
  text-align: center;
  margin-bottom: 20px;
`;

export const ModalButton = styled.button`
  background-color: #4361EE;
  color: white;
  font-size: 18px;
  font-weight: bold;
  width: 100%;
  padding: 15px;
  border-radius: 20px;
  border: none;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: ${darken(0.1, '#4361EE')};
  }
`;

export const CloseButton = styled.button`
  background: none;
  border: none;
  color: #4361EE;
  font-size: 20px;
  font-weight: bold;
  position: absolute;
  top: 10px;
  right: 10px;
  cursor: pointer;

  &:hover {
    color: ${darken(0.1, '#4361EE')};
  }
`;
export const KPIButton = styled.button`
  background-color: #4361EE;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  width: 200px;
  height: 50px; 
  border-radius: 20px;
  color: white;
  font-size: 16px;
  font-weight: bold;
  text-align: center;
  border: none;
  cursor: pointer;

  &:hover {
    background-color: ${darken(0.1, '#4361EE')};
  }

  @media (max-width: 768px) {
    width: 150px; 
    height: 45px;
    font-size: 14px; 
  }
`;
export const EditKPIModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
`;

export const EditKPIModalContainer = styled.div`
  background-color: #FFFFFF;
  padding: 30px;
  border-radius: 20px;
  width: 500px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  align-items: center;

  @media (max-width: 768px) {
    width: 90%;
  }
`;

export const EditKPIModalTitle = styled.h2`
  color: #2D3A56;
  font-weight: bold;
  margin-bottom: 20px;
  font-size: 24px;
`;

export const EditKPIInput = styled.input`
  background-color: #E6F7F7;
  width: 100%;
  height: 50px;
  border-radius: 15px;
  border: 3px solid #2F8F9D;
  margin-bottom: 15px;
  padding: 10px 15px;
  font-size: 14px;
  font-weight: bold;
  color: #333;

  &:focus {
    outline: none;
    border-color: ${darken(0.1, '#2F8F9D')};
  }
`;

export const EditKPIActions = styled.div`
  display: flex;
  gap: 20px;
  margin-top: 10px;
  width: 100%;
`;

export const EditKPIButton = styled.button`
  flex: 1;
  background-color: #4361EE;
  color: white;
  font-size: 16px;
  font-weight: bold;
  padding: 12px;
  border-radius: 15px;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: ${darken(0.1, '#4361EE')};
  }
`;

export const CancelKPIButton = styled.button`
  flex: 1;
  background-color: #e0e0e0;
  color: #333;
  font-size: 16px;
  font-weight: bold;
  padding: 12px;
  border-radius: 15px;
  border: none;
  cursor: pointer;

  &:hover {
    background-color: ${darken(0.1, '#e0e0e0')};
  }
`;

export const CloseEditKPIButton = styled.button`
  position: absolute;
  top: 12px;
  right: 18px;
  background: none;
  border: none;
  font-size: 24px;
  color: #4361EE;
  cursor: pointer;

  &:hover {
    color: ${darken(0.1, '#4361EE')};
  }
`;


export const SettingsContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 100px;
  background-color: #F0F7FF;
  height: 100vh;
`;

export const SettingsTitle = styled.h1`
  font-size: 36px;
  font-weight: bold;
  color: #2D3A56;
  margin-bottom: 40px;
`;

export const SettingsForm = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 600px;

  @media (max-width: 768px) {
    width: 90%;
  }
`;

export const SettingsInput = styled.input`
  background-color: #E6F7F7;
  height: 62px;
  border-radius: 20px;
  border: 3px solid #2F8F9D;
  padding: 0 20px;
  font-size: 16px;
  font-weight: bold;
  color: #333;

  &::placeholder {
    color: #999;
  }

  &:focus {
    outline: none;
    border-color: ${darken(0.1, '#2F8F9D')};
  }
`;

export const SaveButton = styled.button`
  background-color: rgba(67, 97, 238, 0.8);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  height: 62px;
  border-radius: 20px;
  color: white;
  font-size: 20px;
  font-weight: bold;
  border: none;
  cursor: pointer;

  &:hover {
    background-color: ${darken(0.1, 'rgba(67, 97, 238, 0.8)')};
  }
`;

export const SuccessMessage = styled.p`
  color: #4361EE;
  font-weight: bold;
  margin-top: 20px;
`;
