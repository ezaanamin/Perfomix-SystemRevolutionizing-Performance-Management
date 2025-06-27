import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Switch, FormControlLabel } from '@mui/material';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { useDispatch } from 'react-redux';
import { ADDKPI, editKpi } from '../API/slice/API';

const EditKPIModal = ({ open, onClose, selectedKPI }) => {
  const dispatch = useDispatch();
  const [status, setStatus] = useState(selectedKPI?.status === 'active'); 

  useEffect(() => {
    if (selectedKPI) {
      setStatus(selectedKPI.status === 'active');
    }
  }, [selectedKPI]);

  const handleStatusChange = (event) => {
    setStatus(event.target.checked);
  };

  const handleSubmit = (values) => {
    values.status = status ? 'active' : 'inactive';

    if (selectedKPI && selectedKPI.id) {
      
      dispatch(editKpi({ ...values, kpi_id: selectedKPI.id }));
    } else {
      
      dispatch(ADDKPI(values));
    }

    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{selectedKPI ? 'Edit KPI' : 'Add New KPI'}</DialogTitle>
      <Formik
        initialValues={{
          role: selectedKPI ? selectedKPI.role : '',  
          kpi: selectedKPI ? selectedKPI.kpi_name : '',
          target: selectedKPI ? selectedKPI.target : '',
          status: selectedKPI ? selectedKPI.status : 'inactive',
        }}
        validationSchema={Yup.object({
          kpi: Yup.string().required('KPI Name is required'),
          target: Yup.number().positive().integer().required('Target is required'),
        })}
        onSubmit={handleSubmit}
      >
        {({ touched, errors, handleChange, handleBlur, values }) => (
          <Form>
            <DialogContent>
              <Field
                as={TextField}
                label="Role"
                name="role"
                value={values.role}
                onChange={handleChange}
                onBlur={handleBlur}
                fullWidth
                margin="normal"
                disabled
                
              />
              <Field
                as={TextField}
                label="KPI Name"
                name="kpi"
                value={values.kpi}
                onChange={handleChange}
                onBlur={handleBlur}
                fullWidth
                margin="normal"
                error={touched.kpi && Boolean(errors.kpi)}
                helperText={touched.kpi && errors.kpi}
              />
              <Field
                as={TextField}
                label="Target"
                name="target"
                type="number"
                value={values.target}
                onChange={handleChange}
                onBlur={handleBlur}
                fullWidth
                margin="normal"
                error={touched.target && Boolean(errors.target)}
                helperText={touched.target && errors.target}
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={status}
                    onChange={handleStatusChange}
                    name="status"
                    color="primary"
                  />
                }
                label={status ? 'Active' : 'Inactive'}
                style={{
                  marginTop: '20px',
                  display: 'flex',
                  justifyContent: 'space-between',
                }}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={onClose} color="primary">
                Cancel
              </Button>
              <Button type="submit" color="primary">
                {selectedKPI ? 'Update' : 'Add'} KPI
              </Button>
            </DialogActions>
          </Form>
        )}
      </Formik>
    </Dialog>
  );
};

export default EditKPIModal;
