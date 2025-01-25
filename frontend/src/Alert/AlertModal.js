import React, { useState } from 'react';
import {
  ModalOverlay,
  ModalContainer,
  ModalTitle,
  ModalMessage,
  ModalButton,
  CloseButton
} from "../style/style"

export const AlertModal = ({ isOpen, onClose, title, message }) => {
  if (!isOpen) return null;

  return (
    <ModalOverlay>
      <ModalContainer>
        <CloseButton onClick={onClose}>X</CloseButton>
        <ModalTitle>{title}</ModalTitle>
        <ModalMessage>{message}</ModalMessage>
        <ModalButton onClick={onClose}>Okay</ModalButton>
      </ModalContainer>
    </ModalOverlay>
  );
};