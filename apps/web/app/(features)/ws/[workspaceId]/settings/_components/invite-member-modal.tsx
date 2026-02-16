"use client";

import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
} from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useServerFormValidationErrors } from "@/_commons/api";
import {
  inviteMemberSchema,
  ROLE_DESCRIPTIONS,
  ROLE_LABELS,
  type InviteMemberFormData,
} from "../_schemas/invite-member.schema";

interface InviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: InviteMemberFormData) => void;
  isPending: boolean;
  error: Error | null;
}

export function InviteMemberModal({
  isOpen,
  onClose,
  onSubmit,
  isPending,
  error,
}: InviteMemberModalProps) {
  const form = useForm<InviteMemberFormData>({
    defaultValues: {
      email: "",
      role: "member",
    },
    resolver: zodResolver(inviteMemberSchema),
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = form;

  const generalError = useServerFormValidationErrors(form, error);

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleFormSubmit = (data: InviteMemberFormData) => {
    onSubmit(data);
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <ModalContent>
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <ModalHeader>Invitar Miembro</ModalHeader>
          <ModalBody className="gap-4">
            <Input
              label="Correo Electrónico"
              placeholder="usuario@ejemplo.com"
              type="email"
              {...register("email")}
              isInvalid={!!errors.email}
              errorMessage={errors.email?.message}
              variant="flat"
              isRequired
            />

            <Select
              label="Rol"
              placeholder="Selecciona un rol"
              selectedKeys={[watch("role")]}
              onSelectionChange={keys => {
                const value = Array.from(keys)[0] as InviteMemberFormData["role"];
                if (value) setValue("role", value);
              }}
              isInvalid={!!errors.role}
              errorMessage={errors.role?.message}
              variant="flat"
              isRequired
            >
              {Object.entries(ROLE_LABELS).map(([value, label]) => (
                <SelectItem
                  key={value}
                  description={ROLE_DESCRIPTIONS[value as keyof typeof ROLE_DESCRIPTIONS]}
                >
                  {label}
                </SelectItem>
              ))}
            </Select>

            <p className="text-small text-default-500">
              Se enviará una invitación por correo a esta dirección. El destinatario podrá aceptar
              la invitación para unirse al espacio de trabajo.
            </p>

            {generalError && <p className="text-small text-danger">{generalError}</p>}
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={handleClose}>
              Cancelar
            </Button>
            <Button color="primary" type="submit" isLoading={isPending}>
              Enviar Invitación
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
