import React from 'react'
import { Container,Logo,LeftContent,LoginText } from '../style/style'
import Logo1 from "../images/logo1.png"
import LoginField from '../components/LoginField'

function Login() {
  return (
  <Container>
<Logo src={Logo1} alt='Logo'/>
<LeftContent>

    <LoginText>Welcome Back!!</LoginText>
    <LoginField/>
</LeftContent>
  </Container>
  )
}

export default Login