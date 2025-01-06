import React from 'react';
import { LoginFields, LoginContainer, LoginButton, Forgotten } from '../style/style';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

function LoginField() {
  // Validation schema
  const LoginSchema = Yup.object().shape({
    username: Yup.string().required(' Username is Required'),
    password: Yup.string().required(' Password is Required'),
  });

  return (
    <LoginContainer>
      <Formik
        initialValues={{
          username: '',
          password: '',
        }}
        validationSchema={LoginSchema}
        onSubmit={(values) => {
          console.log(values); 
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
