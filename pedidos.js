
// Sistema de Pedidos - Schneider Bebidas
let pedido = JSON.parse(localStorage.getItem('pedido_schneider')) || {};

function atualizarContador() {
    const totalItens = Object.values(pedido).reduce((acc, curr) => acc + curr.qtd, 0);
    const btnRelatorio = document.getElementById('btn-relatorio');
    if (btnRelatorio) {
        btnRelatorio.innerHTML = `📋 Gerar Relatório (${totalItens})`;
        btnRelatorio.style.display = totalItens > 0 ? 'block' : 'none';
    }
    localStorage.setItem('pedido_schneider', JSON.stringify(pedido));
}

function alterarQuantidade(id, nome, preco, delta) {
    if (!pedido[id]) {
        pedido[id] = { nome, preco, qtd: 0 };
    }
    
    pedido[id].qtd += delta;
    
    if (pedido[id].qtd <= 0) {
        delete pedido[id];
    }
    
    const input = document.getElementById(`qtd-${id}`);
    if (input) input.value = pedido[id] ? pedido[id].qtd : 0;
    
    atualizarContador();
}

function gerarRelatorio() {
    const itens = Object.values(pedido);
    if (itens.length === 0) return;

    const dataAtual = new Date().toLocaleDateString('pt-BR');
    let totalGeral = 0;

    let htmlRelatorio = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <title>Relatório de Pedido - Schneider Bebidas</title>
        <style>
            body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
            .header { text-align: center; border-bottom: 2px solid #3d4f45; padding-bottom: 20px; margin-bottom: 30px; }
            .header h1 { color: #3d4f45; margin: 0; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
            th { background-color: #3d4f45; color: white; }
            tr:nth-child(even) { background-color: #f9f9f9; }
            .total { text-align: right; font-size: 1.2rem; font-weight: bold; color: #3d4f45; }
            .footer { margin-top: 50px; font-size: 0.9rem; color: #666; text-align: center; }
            @media print {
                .no-print { display: none; }
                body { padding: 0; }
            }
            .btn-print {
                background: #3d4f45; color: white; border: none; padding: 10px 20px;
                border-radius: 5px; cursor: pointer; font-size: 1rem; margin-bottom: 20px;
            }
        </style>
    </head>
    <body>
        <div class="no-print" style="text-align: right;">
            <button class="btn-print" onclick="window.print()">🖨️ Imprimir / Salvar PDF</button>
        </div>
        <div class="header">
            <h1>RELATÓRIO DE PEDIDO</h1>
            <p>Schneider Bebidas | Data: ${dataAtual}</p>
        </div>
        <table>
            <thead>
                <tr>
                    <th>Produto</th>
                    <th>Qtd</th>
                    <th>Preço Unit.</th>
                    <th>Subtotal</th>
                </tr>
            </thead>
            <tbody>
    `;

    itens.forEach(item => {
        const precoNum = parseFloat(item.preco.replace('R$', '').replace('.', '').replace(',', '.'));
        const subtotal = precoNum * item.qtd;
        totalGeral += subtotal;
        
        htmlRelatorio += `
            <tr>
                <td>${item.nome}</td>
                <td>${item.qtd}</td>
                <td>${item.preco}</td>
                <td>R$ ${subtotal.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</td>
            </tr>
        `;
    });

    htmlRelatorio += `
            </tbody>
        </table>
        <div class="total">Total Estimado: R$ ${totalGeral.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</div>
        <div class="footer">
            <p>Este documento é uma lista de conferência para pedido ao fornecedor.</p>
        </div>
    </body>
    </html>
    `;

    const win = window.open('', '_blank');
    win.document.write(htmlRelatorio);
    win.document.close();
}

// Inicializar os controles nos cards após o carregamento
document.addEventListener('DOMContentLoaded', () => {
    const cards = document.querySelectorAll('.card');
    cards.forEach((card, index) => {
        const nome = card.querySelector('h3').innerText;
        const preco = card.querySelector('.preco').innerText;
        const id = 'prod-' + index;
        
        const qtdAtual = pedido[id] ? pedido[id].qtd : 0;

        const controles = document.createElement('div');
        controles.className = 'controles-pedido';
        controles.style.cssText = 'display: flex; align-items: center; justify-content: center; gap: 10px; margin-top: 15px; padding-top: 10px; border-top: 1px solid #eee;';
        controles.innerHTML = `
            <button onclick="alterarQuantidade('${id}', '${nome}', '${preco}', -1)" style="width: 30px; height: 30px; border-radius: 50%; border: 1px solid #3d4f45; background: white; color: #3d4f45; cursor: pointer; font-weight: bold;">-</button>
            <input type="number" id="qtd-${id}" value="${qtdAtual}" readonly style="width: 40px; text-align: center; border: none; font-weight: bold; background: transparent;">
            <button onclick="alterarQuantidade('${id}', '${nome}', '${preco}', 1)" style="width: 30px; height: 30px; border-radius: 50%; border: none; background: #3d4f45; color: white; cursor: pointer; font-weight: bold;">+</button>
        `;
        card.querySelector('.card-body').appendChild(controles);
    });

    // Adicionar botão de relatório flutuante
    const btn = document.createElement('button');
    btn.id = 'btn-relatorio';
    btn.style.cssText = 'position: fixed; bottom: 30px; right: 30px; background: #3d4f45; color: white; border: none; padding: 15px 25px; border-radius: 50px; cursor: pointer; font-size: 1.1rem; box-shadow: 0 4px 15px rgba(0,0,0,0.3); z-index: 1000; display: none; font-weight: bold;';
    btn.onclick = gerarRelatorio;
    document.body.appendChild(btn);
    
    atualizarContador();
});
