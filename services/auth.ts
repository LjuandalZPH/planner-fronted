// services/auth.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const authService = {
  async login(email: string, password: string) {
    try {
      const response = await fetch(`${API_URL}/api/users/login/`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Si Django manda un error (ej. credenciales inválidas)
        throw new Error(data.detail || data.error || 'Error al iniciar sesión');
      }

      // Si Django devuelve un token, aquí es donde lo recibimos
      console.log('Login exitoso:', data);
      return data; 
      
    } catch (error: any) {
      console.error('Error en authService:', error.message);
      throw error;
    }
  },

  async register(email: string, password: string) {
    const response = await fetch(`${API_URL}/api/users/register/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Error en el registro');
    return data;
  }
};