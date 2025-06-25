import React from 'react';
import { LoginFields, LoginContainer, LoginButton, Forgotten } from '../style/style';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useDispatch } from 'react-redux';
import { Login } from '../API/slice/API';
import { jwtDecode } from 'jwt-decode';
import { UserContext } from '../ContextState/contextState';
import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';

function LoginField() {
  const navigate = useNavigate();
  const LoginSchema = Yup.object().shape({
    Name: Yup.string().required('Name is Required'),
    password: Yup.string().required('Password is Required'),
  });
  const userContext = useContext(UserContext);
  const { SetRole, SetModal } = userContext;
  const dispatch = useDispatch();

  return (
    <>
      <LoginContainer>
        <Formik
          initialValues={{
            Name: '',
            password: '',
          }}
          validationSchema={LoginSchema}
          onSubmit={async (values) => {
            const response = await dispatch(Login({ Name: values.Name, password: values.password }));
            console.log(response.payload, 'ezaan amin');
            
            if (response.payload.error) {
              SetModal(true); 
            }

            if (response.payload.access_token) {
              localStorage.setItem('access_token', response.payload.access_token);
                
              const data = jwtDecode(response.payload.access_token);
              data.role = data.role.toLowerCase();
              console.log(data.role, 'EZAAN');
              const expirationTime = data.exp * 1000; // convert to ms
               localStorage.setItem('token_expiration', expirationTime);

              localStorage.setItem('role', data.role);
            
              localStorage.setItem('role', data.role);
  const timeRemaining = expirationTime - Date.now();
  setTimeout(() => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('role');
    localStorage.removeItem('token_expiration');
    SetRole(null);
    navigate('/');
  }, timeRemaining);
              // Direct user to respective role page
              if (data.role === 'admin') {
                SetRole(data.role);
                navigate('/admin');
              } else if (data.role.toLowerCase().includes('manager')) {
                SetRole('manager'); 
                navigate('/manager');
              } else {
                SetRole('staff');
                navigate('/staff');
              }
            }
          }}
        >
          {({ errors, touched }) => (
            <Form>
              <div>
                <Field
                  as={LoginFields}
                  name="Name"
                  placeholder="Enter Name"
                />
                {errors.Name && touched.Name && (
                  <div style={{ color: 'red', fontSize: '12px' }}>
                    <ErrorMessage name="Name" />
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
    </>
  );
}

export default LoginField;
