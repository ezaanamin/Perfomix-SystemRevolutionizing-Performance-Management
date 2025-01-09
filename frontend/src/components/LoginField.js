import React from 'react';
import { LoginFields, LoginContainer, LoginButton, Forgotten } from '../style/style';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useDispatch } from 'react-redux'
import { Login } from '../API/slice/API';
import { jwtDecode } from 'jwt-decode';
import { UserContext } from '../ContextState/contextState';
import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
function LoginField() {
  // Validation schema
  const navigate = useNavigate();
  const LoginSchema = Yup.object().shape({
    username: Yup.string().required(' Username is Required'),
    password: Yup.string().required(' Password is Required'),
  });
  const userContext = useContext(UserContext);
  const { SetRole} = userContext;
const dispatch=useDispatch()
  return (
    <LoginContainer>
      <Formik
        initialValues={{
          username: '',
          password: '',
        }}
        validationSchema={LoginSchema}
        onSubmit={async (values) => {
          // console.log(values); 
          const response=  await dispatch(Login({username:values.username,password:values.password}))
          localStorage.setItem("access_token", response.payload.access_token);
          const data=jwtDecode(response.payload.access_token);
          console.log(data.role)
          SetRole(data.role)

          if (data.role === 'Admin') {
            navigate('/admin');
        } else if (data.role === 'Manager') {
            navigate('/manager');
        } else if (data.role === 'Staff') {
            navigate('/staff');
        }

          
          
        }}
      >
        {({ errors, touched }) => (
          <Form>
      
            <div>
              <Field
                as={LoginFields}
                name="username"
                placeholder="Enter Username"
              />
              {errors.username && touched.username && (
                <div style={{ color: 'red', fontSize: '12px' }}>
                  <ErrorMessage name="username" />
                </div>
              )}
            </div>

          
            <div>
              <Field
                as={LoginFields}
                name="password"
                type="password"
                placeholder="Enter Password"
              />
              {errors.password && touched.password && (
                <div style={{ color: 'red', fontSize: '12px' }}>
                  <ErrorMessage name="password" />
                </div>
              )}
            </div>

        
            <Forgotten>Forgotten password</Forgotten>


            <LoginButton type="submit">Login</LoginButton>
          </Form>
        )}
      </Formik>
    </LoginContainer>
  );
}

export default LoginField;
