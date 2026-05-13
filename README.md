# 🎵 Louvor App

Sistema web para gerenciamento completo de ministério de louvor.

O projeto foi criado para organizar:

* membros
* escalas
* ensaios
* repertórios
* confirmações
* aprovações
* grupos vocais
* instrumentistas

Tudo em uma plataforma moderna, responsiva e preparada para PWA.

---

# 🚀 Tecnologias

## Frontend

* Next.js 15
* React
* TypeScript
* Tailwind CSS

## Backend / Database

* Supabase
* PostgreSQL
* Supabase Auth

## UI

* Lucide Icons
* Framer Motion (futuro)
* Sonner (futuro)

---

# 🎯 Objetivo do projeto

Criar um sistema moderno para ministérios de louvor que permita:

* organização de escalas
* controle de músicos e vocalistas
* aprovação de repertórios
* confirmações de presença
* gerenciamento de ensaios
* administração ministerial

---

# 🧠 Estrutura ministerial

## Hierarquia

```txt
Líder Geral
├── Líderes de Instrumentos
├── Líderes Vocais
└── Integrantes
```

## Grupos vocais

| Grupo         | Idade |
| ------------- | ----- |
| Unit          | +30   |
| Ative         | 18-29 |
| Geração Teens | 13-17 |

## Cultos padrão

| Evento  | Horário     |
| ------- | ----------- |
| Domingo | 19:00       |
| Quarta  | 19:30       |
| Ensaio  | Sexta 19:30 |

---

# ✅ Funcionalidades implementadas

## Autenticação

* Cadastro
* Login
* Sessão persistente
* Logout

## Perfil ministerial

* Cadastro de integrante
* Separação vocal automática por idade
* Instrumentistas
* Status ministerial

## Dashboard

* Dashboard responsivo
* Sidebar colapsável
* Layout moderno
* Mobile first

## Escalas

* Criação de semanas ministeriais
* Geração automática:

  * ensaio
  * domingo
  * quarta
* Página individual da semana

## Membros

* Aprovação de integrantes
* Treinamento
* Rejeição
* Desativação
* Reativação
* Modal de confirmação

---

# 🛠️ Estrutura do projeto

```txt
src/
├── app/
├── components/
├── lib/
├── types/
└── utils/
```

---

# ⚙️ Instalação

## Clone

```bash
git clone URL_DO_REPOSITORIO
```

## Instalar dependências

```bash
npm install
```

## Rodar projeto

```bash
npm run dev
```

---

# 🔐 Variáveis ambiente

Criar:

```txt
.env.local
```

Adicionar:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

---

# 📦 Scripts

## Desenvolvimento

```bash
npm run dev
```

## Build

```bash
npm run build
```

## Lint

```bash
npm run lint
```

---

# 📌 Roadmap

## Próximas funcionalidades

* Sistema de repertórios
* Aprovação de repertório
* Escala de instrumentistas
* Escala de vozes
* Confirmações de presença
* Notificações
* Calendário
* PWA
* Push notifications
* App mobile futuramente

---

# 📱 PWA

O projeto será transformado em:

* Progressive Web App
* instalável no celular
* experiência de app nativo

---

# 🎨 UI/UX

Direção visual:

* dark mode
* minimalista
* moderna
* estilo SaaS
* responsiva
* mobile first

---

# 👨‍💻 Autor

Desenvolvido por Breno Oliveira.

---

# 📄 Licença

Projeto privado para uso ministerial.
