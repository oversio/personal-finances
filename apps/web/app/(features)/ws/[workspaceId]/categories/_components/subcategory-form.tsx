"use client";

import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useServerFormValidationErrors } from "@/_commons/api";
import type { Subcategory } from "../_api/category.types";
import { subcategoryFormSchema, type SubcategoryFormData } from "../_schemas/category.schema";
import { useEffect } from "react";

interface SubcategoryFormProps {
  subcategory?: Subcategory;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: SubcategoryFormData) => void;
  isPending: boolean;
  error: Error | null;
}

export function SubcategoryForm({
  subcategory,
  isOpen,
  onClose,
  onSubmit,
  isPending,
  error,
}: SubcategoryFormProps) {
  const form = useForm<SubcategoryFormData>({
    defaultValues: {
      name: subcategory?.name ?? "",
      icon: subcategory?.icon ?? undefined,
    },
    resolver: zodResolver(subcategoryFormSchema),
  });

  useEffect(() => {
    if (subcategory) {
      form.reset({
        name: subcategory.name ?? "",
        icon: subcategory.icon ?? "",
      });
    }
  }, [form, subcategory]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = form;

  const generalError = useServerFormValidationErrors(form, error);

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleFormSubmit = (data: SubcategoryFormData) => {
    onSubmit(data);
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <ModalContent>
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <ModalHeader>{subcategory ? "Editar Subcategoría" : "Agregar Subcategoría"}</ModalHeader>
          <ModalBody className="flex flex-col gap-4">
            <Input
              label="Nombre de la Subcategoría"
              placeholder="Ej: Supermercado, Restaurantes"
              {...register("name")}
              isInvalid={!!errors.name}
              errorMessage={errors.name?.message}
              variant="flat"
              isRequired
            />

            {generalError && <p className="text-small text-danger">{generalError}</p>}
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={handleClose}>
              Cancelar
            </Button>
            <Button type="submit" color="primary" isLoading={isPending}>
              {subcategory ? "Actualizar" : "Agregar"}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
