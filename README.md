# **FormEase**

Um sistema de formulário inteligente com preenchimento automático de dados replicados, autocomplete e geração de PDFs personalizados.

## **Status do Projeto**
- **Autocomplete:** Implementado nos campos necessários.
- **Sistema de Login Admin:** Permite controle de variáveis globais para facilitar mudanças nos cálculos do formulário.
- **PDFs Personalizados:** Dois PDFs estilizados prontos seguindo os padrões já utilizados pela empresa e com melhorias na formatação.

## **Como acessar**

O projeto está hospedado em uma máquina virtual na Oracle Cloud, porém não está aberto para a internet por questões de segurança, sendo acessado apenas por um túnel SSH. É possível hospedar o servidor de desenvolvimento com o servidor local do PHP: 

1. Instale o PHP na sua máquina
2. Configure o php.ini dentro do diretório onde o php está instalado removendo o "**;**" da linha ";extension=pdo_sqlite"
3. Utilize o seguinte comando no terminal
```bash
php -S localhost:8000
```
4. Acesse a URL **localhost:8000** no seu navegador.


## **Como Adicionar Autocomplete**
Para configurar o autocomplete em um campo, siga os passos:

1. **Criar o Input:**
   - Crie um `input` com `id` e `name` únicos.
   
2. **Adicionar Div de Sugestões:**
   - Crie uma `div` logo abaixo do input com o `id`: `<idDoInput>Suggestions`.  
        Ex: `nomeEventoSuggestions`.
   
3. **Configurar a Função JavaScript:**
   - No JavaScript, utilize a função `setupAutocomplete` passando os seguintes parâmetros:
     1. **ID do Input;**
     2. **ID da Div de Sugestões;**
     3. Nome arbitrário do evento (usado no script PHP).

4. **Atualizar Estilo de Autocomplete:**
   - Adicione o `id` da div criada em todos os blocos dentro do arquivo `autocomplete_style`.

5. **PHP Backend:**
   - No script PHP, copie o bloco `if ($_POST['action'])`, e configure a `action` com o nome arbitrário escolhido no passo 3.3.

---

## **TODO**

- [x] Personalizar o PDF com alguma biblioteca JavaScript & validar se todos os campos estão refletidos no PDF.
- [x] Modelar o banco de dados para ter colunas para cada campo com autocomplete.
- [x] Atualizar campos faltantes do novo FMV.
- [x] Criar sistema de login (apenas admin) com controle das variáveis globais para controlar o comportamento do formulário.
  - **Ex:** `taxaChairman = 1.2`
- [x] Adicionar `autocomplete="off"` em inputs específicos para desativar preenchimento automático do navegador.
- [x] Cálculo de pagamento baseado nas faixas de km de deslocamento.
- [x] Ajustar espelhamento da Agenda -> FMV.
- [x] Corrigir salvamento com `sessionStorage` e adicionar salvamento automático.
- [x] Ajustar regra de participantes em atividades (um participante pode ser palestrante OU participação requerida, mas pode participar de várias atividades).
- [x] Remover validação para `downloadButton`.
- [x] Refletir variáveis na impressão do PDF.
- [x] Linkar tag do botão de download do PDF.
- [x] Associar participante ao tipo.
- [x] Conectar dados da agenda com novo PDF Geral.
- [x] Criar um PDF Geral em formato horizontal.
- [x] Refletir quantidade de horas das atividades no PDF.
- [x] Adicionar o parâmetro `maxWidth` no `drawtext` para textos longos (como comentários) e evitar que ultrapassem o limite da caixa.
- [x] Limpar banco de dados e preencher com dados simulados para apresentação final.
- [ ] Otimizar código, remover repetições e padronizar (opcional).

---

## **Bugs**

- [x] Preencher o formulário de pagamento faz o formulário do evento perder dados preenchidos.
- [x] Participantes da agenda podem participar de múltiplas atividades, conforme regra da Sanofi.
- [x] O botão de baixar PDF combinado às vezes falha sem razão aparente.
- [x] Dados de participantes e agendas persistem após envio (possivelmente causado pelo `localStorage`; `sessionStorage` pode resolver).
- [x] O botão de atualização de variáveis globais retorna sucesso, mas não aplica as alterações.
- [x] Alterar o nome do participante cria um novo FMV, deveria associar FMV por ID.
- [x] Criar novo participante altera participantes anteriores para "Expert Externo".
