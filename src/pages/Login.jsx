import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "../hooks/useAuth";
import { login } from "../services/authService";

import {
  Box,
  Flex,
  Heading,
  Button,
  VStack,
  Fieldset,
  Field,
  Input,
} from "@chakra-ui/react";
import { toaster } from "@/components/ui/toaster";
import { PasswordInput } from "@/components/ui/password-input";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must be 8 characters"),
});

const Login = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login: loginUser, user } = useAuth();

  // Redirect to home if user is already logged in
  useEffect(() => {
    if (user) {
      navigate("/home");
    }
  }, [user, navigate]);

  const onSubmit = async data => {
    try {
      const response = await login(data);
      if (response.success) {
        loginUser(response.user);
        navigate("/home");
      } else {
        setError(response.message);
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("An error occurred during login. Please try again.");
    }
  };

  useEffect(() => {
    if (error) {
      toaster.create({
        title: "Error",
        description: error,
        type: "error",
      });
    }
    // eslint-disable-next-line
    setError("");
  }, [error]);

  // If user is already logged in, don't render the login form
  if (user) {
    return null; // The useEffect will handle the navigation
  }

  return (
    <Flex minH="100vh" align="center" justify="center">
      <Box p={8} maxW="md" borderWidth={2} borderRadius="lg" boxShadow="lg">
        <form onSubmit={handleSubmit(onSubmit)}>
          <VStack spaceY={4} align="stretch">
            <Heading size="3xl" textAlign="center">
              Login
            </Heading>

            <Fieldset.Root size="lg">
              <Field.Root invalid={!!errors.username}>
                <Field.Label>Username</Field.Label>
                <Input
                  size="lg"
                  placeholder="Enter username"
                  {...register("username")}
                />
                <Field.ErrorText>{errors.username?.message}</Field.ErrorText>
              </Field.Root>

              <Field.Root invalid={!!errors.password}>
                <Field.Label>Password</Field.Label>
                <PasswordInput
                  size="lg"
                  type="password"
                  placeholder="Enter password"
                  {...register("password")}
                />
                <Field.ErrorText>{errors.password?.message}</Field.ErrorText>
              </Field.Root>
            </Fieldset.Root>

            <Button type="submit" colorPalette="gray" size="lg">
              Login
            </Button>
          </VStack>
        </form>
      </Box>
    </Flex>
  );
};

export default Login;
