# 🚗 Rastreador GPS — GitHub Pages

Frontend estático que conversa **direto** com o simulador (via NGROK), sem
precisar colar link nenhum. Você configura o endereço do servidor **uma vez**
no `config.js` e pronto.

## Arquivos

| Arquivo | O que é |
|---------|---------|
| `index.html` | Estrutura da página |
| `style.css`  | Aparência |
| `app.js`     | Lógica: conecta, busca dados e desenha o mapa |
| `config.js`  | **O único que você edita**: o endereço do servidor |

## Por que existe um endereço pra configurar?

O GitHub Pages é um site na internet; o simulador roda **no seu PC**, que não
tem endereço público. O NGROK dá esse endereço público. O site precisa saber
qual é — mas você só configura **uma vez** usando o **domínio estático grátis**
do NGROK (não muda a cada reinício).

## Passo a passo

### 1. Pegar um domínio estático grátis do NGROK
1. Crie conta em https://ngrok.com/signup
2. Pegue seu domínio fixo em https://dashboard.ngrok.com/domains
   (ex: `meu-rastreador.ngrok-free.app`)

### 2. Configurar o site
Abra `config.js` e troque:
```js
SERVIDOR: "https://meu-rastreador.ngrok-free.app",
```

### 3. Configurar o servidor
No `start.py` (na pasta de cima), coloque o **mesmo** domínio:
```python
DOMINIO_ESTATICO = "meu-rastreador.ngrok-free.app"
```

### 4. Subir tudo
No PC, rode o servidor:
```powershell
python start.py
```
Adicione carros pelo painel que abre em `http://localhost:5000`.

### 5. Publicar no GitHub Pages
Suba a pasta `rastreador/` (com os 4 arquivos + `.nojekyll`) num repositório e
ative Pages em **Settings → Pages → main / root**. O site vai conectar sozinho.

## Testar localmente (sem NGROK)
Rode `python app.py` e abra `rastreador/index.html` direto do seu PC — o
`config.js` detecta que é local e usa `http://localhost:5000` automaticamente.

## Arquitetura
```
GitHub Pages (HTML/CSS/JS)  ──fetch──►  NGROK (domínio fixo)  ──►  Flask/API (seu PC)
```
