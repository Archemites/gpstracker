# 🚗 Rastreador GPS - GitHub Pages

Um rastreador de carros em tempo real que consome a API do simulador hospedado no NGROK.

## Como usar

### Localmente (sem GitHub Pages)

1. Abra o arquivo `index.html` no navegador
2. Cole a URL do NGROK na caixa de entrada
3. Clique em "Conectar"
4. Veja os carros se movendo no mapa em tempo real!

### Hospedar no GitHub Pages

#### 1. Criar repositório no GitHub

1. Acesse [github.com/new](https://github.com/new)
2. Nome: `rastreador-gps` (ou qualquer outro nome)
3. Deixe **público**
4. Clique em "Create repository"

#### 2. Fazer upload dos arquivos

Opção A: Via GitHub Web
```
1. No seu repositório, clique em "Add file" → "Upload files"
2. Arraste o arquivo `index.html` para lá
3. Clique em "Commit changes"
```

Opção B: Via Git (linha de comando)
```powershell
cd rastreador
git init
git add index.html
git commit -m "Initial commit"
git remote add origin https://github.com/SEU_USER/rastreador-gps.git
git branch -M main
git push -u origin main
```

#### 3. Ativar GitHub Pages

1. No repositório, vá em **Settings**
2. Na esquerda, clique em **Pages**
3. Em "Source", selecione **Deploy from a branch**
4. Escolha branch **main** e pasta **/ (root)**
5. Clique em **Save**

Aguarde alguns minutos. Sua URL será algo como:
```
https://SEU_USER.github.io/rastreador-gps
```

#### 4. Usar o rastreador

1. Abra a URL acima no navegador
2. Acesse o terminal e rode o simulador:
   ```powershell
   python start.py
   ```
3. Aguarde aparecer a URL do NGROK (algo como `https://abc123.ngrok.io`)
4. Cole no rastreador
5. Pronto! Veja os carros em tempo real! 🚀

## Funcionalidades

✅ Mapa em tempo real com grade de latitude/longitude  
✅ Rastreamento de múltiplos carros  
✅ Informações: placa, velocidade, distância, motorista  
✅ Seleção de carro (clique para destacar)  
✅ Salva URL do NGROK no localStorage  
✅ Conexão automática na próxima vez  
✅ Responsivo em mobile  

## Notas

- A URL do NGROK muda a cada reinicio do simulador
- Funciona em qualquer rede ( 4G, WiFi, etc)
- GitHub Pages é estático, o backend roda no NGROK
- Marque a URL como favorito ou salve em um lugar seguro

## Arquitetura

```
┌─────────────────┐
│  GitHub Pages   │  (Frontend: HTML/JS)
│  (este site)    │
└────────┬────────┘
         │ FETCH
         ↓
┌─────────────────┐
│     NGROK       │  (Túnel público)
└────────┬────────┘
         │
┌─────────────────┐
│   Flask/API     │  (Backend: simulador)
│  (seu PC)       │
└─────────────────┘
```

---

Made with ❤️
