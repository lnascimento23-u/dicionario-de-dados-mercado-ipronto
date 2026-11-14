const K={ai:'[PK] [NOT NULL] AUTO_INCREMENT',pk:'[PK] [NOT NULL]',pf:'[PK] [FK] [NOT NULL]',nn:'[NOT NULL]',nl:'[NULL]',d1:'[NOT NULL] DEFAULT 1',d0:'[NOT NULL] DEFAULT 0',uq:'[UNIQUE] [NULL]',ts:'[NOT NULL] DEFAULT CURRENT_TIMESTAMP',aif:'[PK] [FK] [NOT NULL] AUTO_INCREMENT'};
const P={n:['N/A','na'],p:['DP','dp'],s:['DPS','dps']};
const RC='ADMIN e GERENTE: leitura e escrita; FUNCIONARIO: leitura';
const RM='GERENTE e FUNCIONARIO: leitura e inserção; ADMIN: leitura; sem UPDATE/DELETE (PR02)';
const RJ='ADMIN: leitura; sem acesso operacional (tabela de junção gerada pelo modelador)';
const LJ=['Gerada pelo MySQL Workbench (relação N:N)','Sem consumo previsto nos requisitos'];

const T=[
{n:'Categoria',d:'Agrupa os produtos comercializados pelo mercado (por exemplo, padaria, açougue, mercearia).',l:['Cadastro manual','Produto; relatórios de estoque'],r:RC,c:[
['id_Categoria','Identificador único da categoria, gerado automaticamente.','INT','ai','n'],
['nome','Nome da categoria; obrigatório.','VARCHAR(50)','nn','n'],
['descricao','Texto livre que detalha a categoria; opcional.','VARCHAR(255)','nl','n'],
['ativo','Situação da categoria: 1 ativa, 0 inativa (exclusão lógica).','TINYINT(1)','d1','n']]},
{n:'Produto',d:'Mercadoria comercializada. Guarda o saldo consolidado (exposição + estoque, RN01) e o estoque mínimo que dispara a reposição (RN04, RN10).',l:['Cadastro manual; saldo atualizado por movimento_estoque','Consulta de estoque, reposição, notas e movimentos'],r:RC,c:[
['id_Produto','Identificador único do produto, gerado automaticamente.','INT','ai','n'],
['codigo_barras','Código de barras do produto; obrigatório e deve identificar o item de forma única.','VARCHAR(50)','nn','n'],
['descricao','Nome comercial do produto.','VARCHAR(150)','nn','n'],
['unidade_medida','Unidade de venda (por exemplo, UN, KG); itens por peso, como açougue, usam quilograma.','VARCHAR(10)','nn','n'],
['preco_venda','Preço de venda ao consumidor; não pode ser negativo.','DECIMAL(10)','nn','n'],
['estoque_minimo','Nível mínimo que sinaliza necessidade de reposição (RN10); padrão 0, não negativo.','INT','d0','n'],
['saldo_estoque','Saldo consolidado atual (RN01); só deve mudar por movimento registrado (RN05, RN08).','INT','d0','n',['movimento_estoque (consolidação transacional)','Consulta de estoque e reposição (RN04)'],'Leitura: todos os perfis; escrita: somente o sistema, via movimento'],
['ativo','Situação do produto: 1 ativo, 0 inativo.','TINYINT(1)','d1','n'],
['Categoria_id_Categoria','Categoria do produto; referencia Categoria.id_Categoria.','INT','pf','n']]},
{n:'Fornecedor',d:'Empresa que fornece mercadorias ao mercado (cerca de sete fornecedores). Base da cotação (RN03) e das notas de entrada.',l:['Cadastro manual ou dados do XML da NF-e (RF05)','produto_fornecedor; nota_entrada'],r:RC,c:[
['id_Fornecedor','Identificador único do fornecedor, gerado automaticamente.','INT','ai','n'],
['razao_social','Razão social do fornecedor.','VARCHAR(100)','nn','n'],
['cnpj','CNPJ sem formatação (14 dígitos); único. Em MEI pode identificar pessoa natural.','VARCHAR(14)','uq','n'],
['telefone','Telefone comercial do fornecedor.','VARCHAR(20)','nn','p'],
['email','E-mail comercial; pode identificar pessoa natural.','VARCHAR(100)','nn','p'],
['contato','Nome do representante comercial.','VARCHAR(100)','nn','p'],
['ativo','Situação do fornecedor: 1 ativo, 0 inativo.','TINYINT(1)','d1','n']]},
{n:'nota_entrada',d:'Cabeçalho do documento fiscal de entrada (NF-e). Preservada para histórico fiscal (PR02) e vinculada à chave de acesso (RN06, RN07).',l:['Importação do XML da NF-e com conferência (RF05)','item_nota_entrada; estorno_devolucao; relatórios'],r:'GERENTE: leitura e inserção; FUNCIONARIO e ADMIN: leitura; sem DELETE (PR02)',c:[
['id_nota_entrada','Identificador da nota. No DDL também é a FK para Fornecedor.id_Fornecedor.','INT','aif','n'],
['chave_de_acesso','Chave de acesso de 44 dígitos da NF-e; não pode se repetir (RN07).','VARCHAR(44)','nn','n'],
['numero_nota','Número da nota fiscal.','INT','nn','n'],
['serie','Série da nota fiscal.','VARCHAR(10)','nn','n'],
['data_emissao','Data e hora de emissão pelo fornecedor.','DATETIME','nn','n'],
['data_recebimento','Data e hora do recebimento físico no mercado.','DATETIME','nn','n'],
['valor_total_nota','Valor total da nota; deve corresponder à soma dos subtotais dos itens.','DECIMAL(10)','nn','n',['Calculado a partir de item_nota_entrada ou do XML','Conferência e relatórios']]]},
{n:'Fornecedor_has_nota_entrada',d:'Tabela de junção N:N gerada pelo modelador entre Fornecedor e nota_entrada. Não consta no DER nem nos requisitos.',l:LJ,r:RJ,c:[
['Fornecedor_id_Fornecedor','Referencia Fornecedor.id_Fornecedor.','INT','pf','n'],
['nota_entrada_id_nota_entrada','Referencia nota_entrada.id_nota_entrada.','INT','pf','n']]},
{n:'produto_fornecedor',d:'Entidade associativa entre produto e fornecedor com o preço de compra praticado (RN03, RN09, RF07). Base da comparação de cotações.',l:['Cadastro de cotação pelo gerente (RF07)','Comparação de preços; historico_preco; reposição'],r:'ADMIN e GERENTE: leitura e escrita; FUNCIONARIO: leitura',c:[
['id_produto_fornecedor','Identificador único do vínculo produto-fornecedor.','INT','ai','n'],
['preco_compra','Preço de compra do produto junto ao fornecedor (RN03); alterações geram histórico (RN09).','DECIMAL(10)','nn','n'],
['codigo_produto_fornecedor','Código do produto no catálogo do fornecedor; opcional.','VARCHAR(50)','nl','n'],
['data_atualizacao','Data e hora da última atualização do preço.','DATETIME','nn','n'],
['Produto_id_Produto','Produto cotado; referencia Produto.id_Produto.','INT','pf','n'],
['Produto_Categoria_id_Categoria','Categoria do produto (parte da chave composta de Produto).','INT','pf','n'],
['Fornecedor_id_Fornecedor','Fornecedor da cotação; referencia Fornecedor.id_Fornecedor.','INT','pf','n']]},
{n:'produto_fornecedor_has_Fornecedor',d:'Tabela de junção N:N gerada pelo modelador entre produto_fornecedor e Fornecedor. Redundante com a FK já existente em produto_fornecedor.',l:LJ,r:RJ,c:[
['produto_fornecedor_id_produto_fornecedor','Referencia produto_fornecedor.id_produto_fornecedor.','INT','pf','n'],
['Fornecedor_id_Fornecedor','Referencia Fornecedor.id_Fornecedor.','INT','pf','n']]},
{n:'produto_fornecedor_has_Produto',d:'Tabela de junção N:N gerada pelo modelador entre produto_fornecedor e Produto. Redundante com a FK já existente em produto_fornecedor.',l:LJ,r:RJ,c:[
['produto_fornecedor_id_produto_fornecedor','Referencia produto_fornecedor.id_produto_fornecedor.','INT','pf','n'],
['Produto_id_Produto','Referencia Produto.id_Produto.','INT','pf','n'],
['Produto_Categoria_id_Categoria','Categoria do produto (parte da chave composta de Produto).','INT','pf','n']]},
{n:'usuario',d:'Pessoa autorizada a usar o sistema. Sustenta perfis de acesso (RN12, RF10), autoria das movimentações e auditoria. Contém dados pessoais (PR01, LGPD).',l:['Cadastro pelo ADMIN (RF10)','Autenticação; movimento_estoque; log_auditoria; estorno_devolucao'],r:'ADMIN: leitura e escrita; GERENTE: leitura (sem senha_hash); FUNCIONARIO: apenas o próprio registro',c:[
['id_usuario','Identificador único do usuário.','INT','ai','n'],
['nome','Nome completo do usuário.','VARCHAR(100)','nn','p'],
['login','Identificador de acesso; deve ser único.','VARCHAR(50)','nn','p'],
['senha_hash','Hash da senha; nunca armazenar texto puro.','VARCHAR(255)','nn','p',['Gerado pela aplicação no cadastro ou troca de senha','Somente o serviço de autenticação'],'Nenhum perfil humano; apenas o serviço de autenticação'],
['perfil','Perfil de acesso (RN12): gerente, admin ou funcionario.',"ENUM('gerente','admin','funcionario')",'nn','n'],
['email','E-mail do usuário.','VARCHAR(100)','nn','p'],
['data_consentimento_lgpd','Data e hora do consentimento para tratamento de dados (PR01); vazio se não coletado.','DATETIME','nl','p'],
['ativo','Situação do usuário: 1 ativo, 0 inativo.','TINYINT(1)','d1','n']]},
{n:'log_auditoria',d:'Trilha de auditoria de operações sobre as tabelas do sistema (RNF06). Registros não devem ser alterados nem apagados.',l:['Gerada pela aplicação ou por triggers a cada INSERT, UPDATE ou DELETE','Auditoria e conformidade'],r:'ADMIN e GERENTE: leitura; escrita somente pelo sistema; FUNCIONARIO: sem acesso',c:[
['id_log','Identificador único do registro de log.','INT','ai','n'],
['usuario_id_usuario','Usuário que executou a operação; referencia usuario.id_usuario.','INT','pf','p'],
['tabela_afetada','Nome da tabela alterada.','VARCHAR(50)','nn','n'],
['operacao','Tipo da operação: UPDATE, INSERT ou DELETE.',"ENUM('UPDATE','INSERT','DELETE')",'nn','n'],
['data_hora','Momento da operação, gravado pelo servidor.','DATETIME','ts','n'],
['detalhes_json','Valores anterior e novo em JSON; pode conter dados pessoais.','TEXT(100)','nn','p']]},
{n:'historico_preco',d:'Registra cada mudança do preço de compra de um vínculo produto-fornecedor, permitindo comparar a evolução dos preços (RN09).',l:['Gerado ao alterar produto_fornecedor.preco_compra','Análise de cotação; relatórios'],r:'ADMIN, GERENTE e FUNCIONARIO: leitura; escrita somente pelo sistema',c:[
['id_historico','Identificador único do registro de histórico.','INT','ai','n'],
['produto_fornecedor_id_produto_fornecedor','Vínculo produto-fornecedor alterado; referencia produto_fornecedor.','INT','pf','n'],
['preco_anterior','Preço de compra antes da alteração.','DECIMAL(10)','nn','n'],
['preco_novo','Preço de compra após a alteração.','DECIMAL(10)','nn','n'],
['data_alteracao','Data e hora da alteração do preço.','DATETIME','nn','n']]},
{n:'estorno_devolucao',d:'Registra estorno ou devolução de uma nota de entrada, com autor, motivo e valor.',l:['Registro pelo gerente na devolução de mercadoria','Ajuste de estoque; relatórios financeiros'],r:'GERENTE: leitura e inserção; ADMIN: leitura; FUNCIONARIO: sem acesso',c:[
['id_estorno_devolucao','Identificador único do estorno.','INT','ai','n'],
['id_nota','Nota de entrada estornada (sem FK declarada no DDL).','INT','pk','n'],
['usuario_id_usuario','Usuário que autorizou o estorno; referencia usuario.id_usuario.','INT','pf','p'],
['data_estorno','Data e hora do estorno.','DATETIME','nn','n'],
['motivo','Justificativa do estorno; obrigatória.','VARCHAR(255)','nn','n'],
['total_estorno','Valor total estornado.','DECIMAL(10)','nn','n']]},
{n:'lote_produto',d:'Controle de lote e validade de um produto, com quantidades inicial e atual, base dos alertas de vencimento (RN11, RF08).',l:['Registro no recebimento da mercadoria (RN11)','Alertas de vencimento; movimento_estoque; item_nota_entrada'],r:RM,c:[
['id_lote_produto','Identificador único do lote.','INT','ai','n'],
['Produto_id_Produto','Produto do lote; referencia Produto.id_Produto.','INT','pf','n'],
['numero_lote','Número do lote informado pelo fornecedor.','VARCHAR(50)','nn','n'],
['data_fabricacao','Data de fabricação do lote.','DATETIME','nn','n'],
['data_validade','Data de validade; base do alerta de vencimento.','DATETIME','nn','n'],
['quantidade_inicial','Quantidade recebida no lote.','INT','nn','n'],
['quantidade_atual','Quantidade remanescente do lote.','INT','nn','n']]},
{n:'movimento_estoque',d:'Histórico de toda entrada, saída ou ajuste que altera o saldo (RN05, RN08). Registra produto, lote, usuário, tipo e quantidade.',l:['Entradas por nota, ajustes de inventário e saídas do caixa (integração futura)','Atualização de Produto.saldo_estoque; relatórios (RF09)'],r:RM,c:[
['id_movimento_estoque','Identificador único da movimentação.','INT','ai','n'],
['Produto_id_Produto','Produto movimentado; referencia Produto.id_Produto.','INT','pf','n'],
['Produto_Categoria_id_Categoria','Categoria do produto (parte da chave composta de Produto).','INT','pf','n'],
['usuario_id_usuario','Usuário responsável; referencia usuario.id_usuario.','INT','pf','p'],
['lote_produto_id_lote_produto','Lote movimentado; referencia lote_produto.id_lote_produto.','INT','pf','n'],
['lote_produto_Produto_id_Produto','Produto do lote (parte da chave composta de lote_produto).','INT','pf','n'],
['tipo_movimento','Tipo: E entrada, S saída, A ajuste, P perda, DF devolução a fornecedor, ES estorno.',"ENUM('E','S','A','P','DF','ES')",'nn','n'],
['quantidade','Quantidade movimentada; deve ser maior que zero.','INT','nn','n'],
['data_hora','Momento da movimentação, gravado pelo servidor.','DATETIME','nn','n'],
['origem_documento','Documento de origem (por exemplo, número da nota); opcional.','VARCHAR(50)','nl','n'],
['observacao','Justificativa ou observação; recomendada em ajustes manuais.','VARCHAR(255)','nl','n']]},
{n:'item_nota_entrada',d:'Itens de uma nota de entrada: produto, lote, quantidade e valores (RN02, RN06). Vincula os produtos recebidos ao documento fiscal.',l:['Itens extraídos do XML da NF-e (RF05) e conferidos','movimento_estoque; custo de compra'],r:RM,c:[
['id_item_nota_entrada','Identificador único do item.','INT','ai','n'],
['Produto_id_Produto','Produto recebido; referencia Produto.id_Produto.','INT','pf','n'],
['Produto_Categoria_id_Categoria','Categoria do produto (parte da chave composta de Produto).','INT','pf','n'],
['lote_produto_id_lote_produto','Lote do item; referencia lote_produto.id_lote_produto.','INT','pf','n'],
['lote_produto_Produto_id_Produto','Produto do lote (parte da chave composta de lote_produto).','INT','pf','n'],
['nota_entrada_id_nota_entrada','Nota de entrada do item; referencia nota_entrada.id_nota_entrada.','INT','pf','n'],
['id_quantidade','Quantidade recebida do item; deve ser maior que zero.','INT','nn','n'],
['valor_unitario_compra','Valor unitário de compra.','DECIMAL(10)','nn','n'],
['subtotal','Valor do item (quantidade x valor unitário).','DECIMAL(10)','nn','n',['Calculado: quantidade x valor_unitario_compra','Somatório em nota_entrada.valor_total_nota']]]}
];

const $=s=>document.querySelector(s);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const id=n=>'tabela_'+n;
const kfmt=k=>esc(K[k]||k).replace(/\[[^\]]+\]/g,m=>'<strong class="k">'+m+'</strong>');
const lfmt=l=>'<strong>Origem:</strong> '+esc(l[0])+'<br><strong>Destino:</strong> '+esc(l[1]);

function render(){
  $('#dictionary').innerHTML=T.map(t=>{
    const rows=t.c.map(c=>{
      const b=P[c[4]],l=c[5]||t.l,r=c[6]||t.r;
      return `<tr data-s="${esc((t.n+' '+c[0]).toLowerCase())}"><td>${esc(c[0])}</td><td>${esc(c[1])}</td><td class="type">${esc(c[2])}</td><td>${kfmt(c[3])}</td><td><span class="badge ${b[1]}">${b[0]}</span></td><td>${lfmt(l)}</td><td>${esc(r)}</td></tr>`;
    }).join('');
    return `<section id="${id(t.n)}" class="card tbl" data-t="${esc(t.n.toLowerCase())}"><div class="tbl-head"><h2>${esc(t.n)}</h2><span class="tag">${t.c.length} colunas</span></div><p>${esc(t.d)}</p><div class="table-wrap"><table class="dd"><thead><tr><th>Atributo</th><th>Descrição / Regra de Negócio</th><th>Tipo e Tamanho</th><th>Constraints</th><th>Privacidade (LGPD/GDPR)</th><th>Linhagem (Data Lineage)</th><th>Controle de Acesso (RBAC)</th></tr></thead><tbody>${rows}</tbody></table></div></section>`;
  }).join('');
  $('#tableNav').innerHTML=T.map(t=>`<a href="#${id(t.n)}" data-t="${esc(t.n.toLowerCase())}">${esc(t.n)}</a>`).join('');
  $('#tblCount').textContent=T.length;
}

function filter(){
  const q=$('#search').value.trim().toLowerCase();
  let ts=0,rs=0;
  document.querySelectorAll('.tbl').forEach(sec=>{
    const nameHit=!q||sec.dataset.t.includes(q);
    let any=false;
    sec.querySelectorAll('tbody tr').forEach(tr=>{
      const show=nameHit||tr.dataset.s.includes(q);
      tr.hidden=!show;if(show){any=true;rs++;}
    });
    sec.hidden=!any;if(any)ts++;
    const a=document.querySelector(`#tableNav a[data-t="${sec.dataset.t}"]`);if(a)a.hidden=!any;
  });
  $('#empty').hidden=ts>0;
  $('#resultInfo').textContent=q?`${ts} tabela(s) e ${rs} coluna(s) encontradas.`:'';
}

function theme(m){document.documentElement.dataset.theme=m;$('#themeBtn').textContent=m==='dark'?'Modo claro':'Modo escuro';try{localStorage.setItem('theme',m)}catch(e){}}

let pz=null;
function openDer(){
  $('#modal').hidden=false;document.body.style.overflow='hidden';
  const img=$('#derImg');
  const init=()=>{
    if(pz)pz.destroy();
    pz=Panzoom(img,{maxScale:10,minScale:0.05,contain:false,cursor:'grab'});
    const vp=$('#viewport');
    const s=Math.min(vp.clientWidth/img.naturalWidth,vp.clientHeight/img.naturalHeight);
    pz.zoom(s,{animate:false});pz.pan(0,0,{animate:false});
    img._fit=s;
  };
  if(img.complete&&img.naturalWidth)init();else img.onload=init;
}
function closeDer(){$('#modal').hidden=true;document.body.style.overflow='';}

document.addEventListener('DOMContentLoaded',()=>{
  render();
  let m='light';try{m=localStorage.getItem('theme')||(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light')}catch(e){}
  theme(m);
  $('#themeBtn').onclick=()=>theme(document.documentElement.dataset.theme==='dark'?'light':'dark');
  $('#search').addEventListener('input',filter);
  $('#derBtn').onclick=openDer;$('#derInline').onclick=openDer;$('#closeDer').onclick=closeDer;
  $('#zIn').onclick=()=>pz&&pz.zoomIn();
  $('#zOut').onclick=()=>pz&&pz.zoomOut();
  $('#zReset').onclick=()=>{if(!pz)return;const i=$('#derImg');pz.reset({animate:false});pz.zoom(i._fit||1,{animate:false});pz.pan(0,0,{animate:false});};
  $('#viewport').addEventListener('wheel',e=>{if(pz)pz.zoomWithWheel(e)},{passive:false});
  document.addEventListener('keydown',e=>{if(e.key==='Escape')closeDer()});
  const sb=$('#sidebar');
  $('#menuBtn').onclick=()=>sb.classList.toggle('open');
  sb.addEventListener('click',e=>{if(e.target.tagName==='A')sb.classList.remove('open')});
});

