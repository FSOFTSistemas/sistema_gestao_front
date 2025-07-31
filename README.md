# Sistema de Gestão - Frontend React

Frontend moderno desenvolvido em React para o sistema de gestão de pequenos negócios, com design inspirado no Postman (laranja e branco).

## 🚀 Funcionalidades Implementadas

### 🔐 **Autenticação**
- ✅ Tela de login moderna e responsiva
- ✅ Registro de novos usuários
- ✅ Autenticação JWT com tokens
- ✅ Proteção de rotas
- ✅ Logout seguro

### 📊 **Dashboard**
- ✅ Visão geral do negócio
- ✅ Estatísticas de clientes e produtos
- ✅ Alertas de estoque baixo
- ✅ Ações rápidas
- ✅ Cards informativos

### 👥 **Gestão de Clientes**
- ✅ CRUD completo (Criar, Ler, Atualizar, Deletar)
- ✅ Busca por nome, email ou CPF/CNPJ
- ✅ Filtros por status (ativo/inativo)
- ✅ Paginação
- ✅ Modal de edição/criação
- ✅ Validação de formulários

### 📦 **Gestão de Produtos**
- ✅ CRUD completo
- ✅ Busca por nome, código de barras ou categoria
- ✅ Filtros por status, categoria e estoque baixo
- ✅ Cálculo automático de margem de lucro
- ✅ Alertas de estoque baixo
- ✅ Paginação
- ✅ Modal de edição/criação
- ✅ Validação de formulários

## 🎨 **Design**

### Paleta de Cores
- **Laranja Principal**: `#f97316` (orange-500)
- **Laranja Hover**: `#ea580c` (orange-600)
- **Laranja Claro**: `#fed7aa` (orange-200)
- **Fundo Laranja**: `#fff7ed` (orange-50)
- **Branco**: `#ffffff`
- **Cinza Claro**: `#f9fafb` (gray-50)
- **Cinza Médio**: `#6b7280` (gray-500)
- **Cinza Escuro**: `#111827` (gray-900)

### Componentes
- **Sidebar** responsiva com navegação
- **Header** com informações do usuário
- **Cards** informativos no dashboard
- **Tabelas** responsivas com paginação
- **Modais** para formulários
- **Toasts** para notificações
- **Botões** com estados de loading

## 🛠️ **Tecnologias Utilizadas**

- **React 18** - Biblioteca principal
- **React Router DOM** - Roteamento
- **Tailwind CSS** - Estilização
- **Lucide React** - Ícones
- **React Hook Form** - Formulários
- **Yup** - Validação de esquemas
- **Axios** - Requisições HTTP
- **React Hot Toast** - Notificações

## 📁 **Estrutura do Projeto**

```
src/
├── components/
│   ├── Layout.jsx              # Layout principal com sidebar
│   ├── ProtectedRoute.jsx      # Proteção de rotas
│   ├── ClienteModal.jsx        # Modal de clientes
│   └── ProdutoModal.jsx        # Modal de produtos
├── contexts/
│   └── AuthContext.jsx         # Contexto de autenticação
├── pages/
│   ├── Login.jsx               # Página de login/registro
│   ├── Dashboard.jsx           # Dashboard principal
│   ├── Clientes.jsx            # Gestão de clientes
│   └── Produtos.jsx            # Gestão de produtos
├── services/
│   └── api.js                  # Configuração da API
├── App.jsx                     # Componente principal
└── main.jsx                    # Ponto de entrada
```

## 🚀 **Como Executar**

### Pré-requisitos
- Node.js 16+
- npm ou yarn
- Backend da API rodando na porta 3000

### Instalação
```bash
# Instalar dependências
npm install

# Iniciar em modo de desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview do build
npm run preview
```

### Configuração
O frontend está configurado para se conectar com a API em:
```
http://localhost:3000/api/v1
```

Para alterar a URL da API, edite o arquivo `src/services/api.js`:
```javascript
const API_BASE_URL = 'http://localhost:3000/api/v1';
```

## 📱 **Responsividade**

O sistema é totalmente responsivo e funciona em:
- **Desktop** (1024px+)
- **Tablet** (768px - 1023px)
- **Mobile** (320px - 767px)

### Recursos Responsivos
- Sidebar colapsável em mobile
- Tabelas com scroll horizontal
- Cards que se reorganizam
- Formulários adaptáveis
- Navegação touch-friendly

## 🔐 **Autenticação**

### Fluxo de Autenticação
1. Usuário faz login na tela inicial
2. Token JWT é armazenado no localStorage
3. Token é enviado em todas as requisições
4. Rotas são protegidas automaticamente
5. Logout limpa os dados locais

### Proteção de Rotas
- Todas as rotas principais são protegidas
- Redirecionamento automático para login
- Validação de token no servidor
- Renovação automática de sessão

## 📊 **Funcionalidades do Dashboard**

### Cards de Estatísticas
- Total de clientes
- Clientes ativos
- Total de produtos
- Valor do estoque

### Alertas
- Produtos com estoque baixo
- Notificações importantes

### Ações Rápidas
- Links para gestão de clientes
- Links para gestão de produtos
- Acesso rápido a funcionalidades

## 👥 **Gestão de Clientes**

### Funcionalidades
- **Listar**: Visualização em tabela com paginação
- **Buscar**: Por nome, email ou CPF/CNPJ
- **Filtrar**: Por status (ativo/inativo)
- **Criar**: Modal com formulário completo
- **Editar**: Modal pré-preenchido
- **Excluir**: Com confirmação
- **Ativar/Desativar**: Toggle de status

### Campos do Cliente
- Nome (obrigatório)
- CPF/CNPJ (obrigatório)
- Telefone
- Email
- Endereço completo
- Observações

## 📦 **Gestão de Produtos**

### Funcionalidades
- **Listar**: Visualização em tabela com paginação
- **Buscar**: Por nome, código de barras ou categoria
- **Filtrar**: Por status, categoria e estoque baixo
- **Criar**: Modal com formulário completo
- **Editar**: Modal pré-preenchido
- **Excluir**: Com confirmação
- **Ativar/Desativar**: Toggle de status

### Campos do Produto
- Nome (obrigatório)
- Código de barras
- Preço de venda (obrigatório)
- Custo (obrigatório)
- Unidade (obrigatório)
- Categoria
- Estoque atual (obrigatório)
- Estoque mínimo (obrigatório)
- Descrição
- NCM (fiscal)
- CFOP (fiscal)

### Recursos Especiais
- **Cálculo automático** de margem de lucro
- **Alertas visuais** para estoque baixo
- **Filtro por categoria** dinâmico
- **Validação** de estoque negativo

## 🎯 **Validações**

### Formulários
- Validação em tempo real
- Mensagens de erro claras
- Campos obrigatórios marcados
- Formatação automática (CPF, telefone)

### Regras de Negócio
- CPF/CNPJ únicos
- Preços positivos
- Estoque não negativo
- Email válido

## 🔔 **Notificações**

### Toast Messages
- **Sucesso**: Verde com ícone de check
- **Erro**: Vermelho com ícone de X
- **Aviso**: Amarelo com ícone de alerta
- **Info**: Azul com ícone de informação

### Posicionamento
- Canto superior direito
- Duração de 4 segundos
- Empilhamento automático

## 🎨 **Componentes Reutilizáveis**

### Layout
- Sidebar responsiva
- Header com usuário
- Área de conteúdo

### Modais
- Backdrop com blur
- Animações suaves
- Formulários validados
- Estados de loading

### Tabelas
- Paginação completa
- Ordenação
- Filtros
- Ações por linha

## 📈 **Performance**

### Otimizações
- Lazy loading de componentes
- Memoização de cálculos
- Debounce em buscas
- Paginação eficiente

### Bundle Size
- Tailwind CSS otimizado
- Tree shaking automático
- Chunks separados
- Compressão gzip

## 🧪 **Testes**

### Testes Manuais
- ✅ Login/logout
- ✅ Navegação entre páginas
- ✅ CRUD de clientes
- ✅ CRUD de produtos
- ✅ Responsividade
- ✅ Validações de formulário

## 🚀 **Deploy**

### Build de Produção
```bash
npm run build
```

### Arquivos Gerados
- `dist/` - Arquivos otimizados
- `index.html` - Página principal
- Assets com hash para cache

### Configuração do Servidor
- Servir arquivos estáticos
- Fallback para index.html (SPA)
- Headers de cache apropriados

## 🔧 **Configurações**

### Vite Config
```javascript
export default {
  server: {
    port: 5173,
    host: true
  },
  build: {
    outDir: 'dist',
    sourcemap: false
  }
}
```

### Tailwind Config
```javascript
module.exports = {
  content: ['./src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        orange: colors.orange
      }
    }
  }
}
```

## 📞 **Suporte**

Para dúvidas ou problemas:
1. Verifique se a API está rodando
2. Confirme as configurações de URL
3. Verifique o console do navegador
4. Teste em modo incógnito

---

**Desenvolvido com React + Tailwind CSS** 🚀

# sistema_gestao_front
