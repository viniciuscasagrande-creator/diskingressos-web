import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, UserRole, PermissionMatrix, AuditLogEntry } from '../types/auth';
import type { Producer } from '../types/producer';
import { mockUsers, defaultPermissionsByRole } from '../data/users';
import { mockProducers } from '../data/producers';
import { initialAuditLogs } from '../data/auditLogs';

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  activeProducer: Producer | null; // null = Todas as Produtoras (apenas Admin Master)
  allProducers: Producer[];
  users: User[];
  auditLogs: AuditLogEntry[];
  login: (email: string, password?: string) => boolean;
  logout: () => void;
  selectProducer: (producerId: string | null) => void;
  can: (module: keyof PermissionMatrix, action: string) => boolean;
  recordAuditLog: (action: string, module: AuditLogEntry['module'], details: string, status?: AuditLogEntry['status']) => void;
  createUser: (userData: Omit<User, 'id' | 'lastLogin'>) => void;
  updateUser: (id: string, updates: Partial<User>) => void;
  deleteUser: (id: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Default to Admin Master for initial preview or allow quick login switch
  const [currentUser, setCurrentUser] = useState<User | null>(mockUsers[0]);
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(initialAuditLogs);
  const [selectedProducerId, setSelectedProducerId] = useState<string | null>(null);

  // Determine active producer based on user role and selection
  const activeProducer = React.useMemo(() => {
    if (!currentUser) return null;
    
    // For non-admin-master, producer is strictly fixed by their assigned producerId
    if (currentUser.role !== 'admin-master' && currentUser.role !== 'admin') {
      return mockProducers.find((p) => p.id === currentUser.producerId) || mockProducers[0];
    }
    
    // For admin-master, respect the dropdown selection (or null for All Producers)
    if (!selectedProducerId) return null;
    return mockProducers.find((p) => p.id === selectedProducerId) || null;
  }, [currentUser, selectedProducerId]);

  const recordAuditLog = (
    action: string,
    module: AuditLogEntry['module'],
    details: string,
    status: AuditLogEntry['status'] = 'Concluído'
  ) => {
    const newEntry: AuditLogEntry = {
      id: `AUD-${Date.now().toString().slice(-5)}`,
      timestamp: new Date().toLocaleString('pt-BR'),
      userId: currentUser ? currentUser.id : 'anon',
      userName: currentUser ? currentUser.name : 'Sistema',
      userRole: currentUser ? currentUser.role : 'leitura',
      producerId: activeProducer ? activeProducer.id : currentUser?.producerId || null,
      producerName: activeProducer ? activeProducer.name : 'Visão Global',
      action,
      module,
      details,
      ipAddress: '189.34.120.45',
      status,
    };
    setAuditLogs((prev) => [newEntry, ...prev]);
  };

  const login = (email: string, _password?: string): boolean => {
    const foundUser = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (foundUser) {
      if (foundUser.status === 'inativo' || foundUser.status === 'bloqueado') {
        alert('Este usuário está inativo ou bloqueado no sistema.');
        return false;
      }
      const updated = {
        ...foundUser,
        lastLogin: new Date().toLocaleString('pt-BR'),
      };
      setCurrentUser(updated);
      setUsers((prev) => prev.map((u) => (u.id === foundUser.id ? updated : u)));
      
      // Auto-set producer selection
      if (updated.role !== 'admin-master') {
        setSelectedProducerId(updated.producerId);
      } else {
        setSelectedProducerId(null);
      }

      recordAuditLog('Autenticação de Usuário', 'Segurança', `Login bem-sucedido (${updated.email})`);
      return true;
    }
    return false;
  };

  const logout = () => {
    if (currentUser) {
      recordAuditLog('Encerramento de Sessão', 'Segurança', `Logout realizado (${currentUser.email})`);
    }
    setCurrentUser(null);
    setSelectedProducerId(null);
  };

  const selectProducer = (producerId: string | null) => {
    if (!currentUser || (currentUser.role !== 'admin-master' && currentUser.role !== 'admin')) {
      return; // Forbidden for regular producers
    }
    setSelectedProducerId(producerId);
  };

  const can = (module: keyof PermissionMatrix, action: string): boolean => {
    if (!currentUser) return false;
    if (currentUser.role === 'admin-master') return true;
    
    const modPermissions = currentUser.permissions[module] as Record<string, boolean>;
    if (!modPermissions) return false;
    return !!modPermissions[action];
  };

  const createUser = (userData: Omit<User, 'id' | 'lastLogin'>) => {
    const newUser: User = {
      ...userData,
      id: `user-${Date.now().toString().slice(-4)}`,
      lastLogin: 'Nunca acessou',
    };
    setUsers((prev) => [newUser, ...prev]);
    recordAuditLog(
      'Criação de Usuário',
      'Administração',
      `Usuário ${newUser.name} (${newUser.email}) criado com perfil ${newUser.roleLabel}`
    );
  };

  const updateUser = (id: string, updates: Partial<User>) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, ...updates } : u))
    );
    if (currentUser && currentUser.id === id) {
      setCurrentUser((prev) => (prev ? { ...prev, ...updates } : prev));
    }
    recordAuditLog(
      'Atualização de Usuário/Permissões',
      'Administração',
      `Usuário #${id} atualizado no sistema`
    );
  };

  const deleteUser = (id: string) => {
    const target = users.find((u) => u.id === id);
    setUsers((prev) => prev.filter((u) => u.id !== id));
    if (target) {
      recordAuditLog(
        'Exclusão de Usuário',
        'Administração',
        `Usuário ${target.name} (${target.email}) removido do sistema`,
        'Alerta'
      );
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: !!currentUser,
        activeProducer,
        allProducers: mockProducers,
        users,
        auditLogs,
        login,
        logout,
        selectProducer,
        can,
        recordAuditLog,
        createUser,
        updateUser,
        deleteUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
