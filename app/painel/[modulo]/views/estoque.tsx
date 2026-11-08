import { AlertTriangle, Package, PackagePlus, Trash2 } from 'lucide-react';
import FormDialog from '@/app/painel/ui/form-dialog';
import ActionButton from '@/app/painel/ui/action-button';
import { deleteProduct, restockProduct, saveProduct } from '@/app/painel/finance-actions';
import { canManage, type PanelContext } from '@/lib/panel/context';
import type { Product } from '@/lib/panel/types';
import { loadProducts } from './data';
import { brl, EmptyState } from './shared';

function ProductFields({ product }: { product?: Product }) {
  return <>
    {product && <input type="hidden" name="id" value={product.id}/>}
    <div className="demo-form-row two">
      <label>Nome<input name="name" required minLength={2} maxLength={120} defaultValue={product?.name} placeholder="Ex.: Pomada modeladora"/></label>
      <label>Categoria<input name="category" maxLength={60} defaultValue={product?.category} placeholder="Ex.: Finalizadores"/></label>
    </div>
    <div className="demo-form-row two">
      <label>Código (SKU)<input name="sku" maxLength={60} defaultValue={product?.sku} placeholder="Opcional"/></label>
      <label>Preço de venda (R$)<input name="unit_price" type="number" min={0} step="0.01" required defaultValue={product ? product.unit_price.toFixed(2) : ''}/></label>
    </div>
    <div className="demo-form-row two">
      <label>Quantidade em estoque<input name="quantity" type="number" min={0} step={1} required defaultValue={product?.quantity ?? 0}/></label>
      <label>Estoque mínimo (alerta)<input name="minimum_quantity" type="number" min={0} step={1} defaultValue={product?.minimum_quantity ?? 0}/></label>
    </div>
    <label className="checkbox-row"><input type="checkbox" name="active" defaultChecked={product ? product.active : true}/> Ativo (aparece no PDV e nas comandas)</label>
    <label className="checkbox-row"><input type="checkbox" name="available_to_customer" defaultChecked={product?.available_to_customer ?? false}/> Cliente pode adicionar pela comanda online</label>
  </>;
}

export default async function EstoqueView({ ctx }: { ctx: PanelContext }) {
  const products = await loadProducts(ctx);
  const manage = canManage(ctx.role);
  const active = products.filter((p) => p.active);
  const available = (p: Product) => p.quantity - p.reserved_quantity;
  const low = active.filter((p) => available(p) <= p.minimum_quantity);
  const stockValue = active.reduce((sum, p) => sum + p.quantity * p.unit_price, 0);

  return <>
    <div className="services-topline">
      <div className="service-stat"><small>Produtos ativos</small><b>{active.length}</b><span>{products.length - active.length} inativo(s)</span></div>
      <div className="service-stat"><small>No mínimo ou abaixo</small><b>{low.length}</b><span>considerando reservas em comandas</span></div>
      <div className="service-stat"><small>Valor em estoque</small><b>{brl(stockValue)}</b><span>pelo preço de venda</span></div>
      <div className="service-stat service-stat-action">{manage && <FormDialog title="Novo produto" eyebrow="ESTOQUE" action={saveProduct} submitLabel="Cadastrar" trigger="Novo produto" triggerIcon="plus"><ProductFields/></FormDialog>}</div>
    </div>
    <section className="workspace-card inventory-board">
      <div className="inventory-board-heading"><div><h3>Produtos</h3><p>“Reservado” é o que já foi lançado em comandas abertas; sai do estoque quando a comanda é paga.</p></div>{low.length > 0 && <span className="inventory-alert"><AlertTriangle size={14}/>{low.length} produto(s) precisam de reposição</span>}</div>
      {!products.length ? <EmptyState title="Nenhum produto cadastrado">Cadastre os produtos vendidos no balcão ou usados nas comandas.</EmptyState>
        : <div className="clients-table-wrap"><table className="workspace-table">
          <thead><tr><th>PRODUTO</th><th>PREÇO</th><th>ESTOQUE</th><th>RESERVADO</th><th>DISPONÍVEL</th><th>MÍNIMO</th><th/></tr></thead>
          <tbody>{products.map((p) => { const isLow = p.active && available(p) <= p.minimum_quantity; return <tr key={p.id} className={p.active ? '' : 'is-inactive'}>
            <td><span className={`inventory-product-icon ${isLow ? 'low' : ''}`}><Package size={15}/></span><span className="table-person"><b>{p.name}</b><small>{[p.category, p.sku, p.active ? '' : 'inativo'].filter(Boolean).join(' · ') || '—'}</small></span></td>
            <td><b>{brl(p.unit_price)}</b></td><td>{p.quantity.toLocaleString('pt-BR')}</td><td>{p.reserved_quantity.toLocaleString('pt-BR')}</td><td><b>{available(p).toLocaleString('pt-BR')}</b>{isLow && <span className="status-pill status-noshow">repor</span>}</td><td>{p.minimum_quantity.toLocaleString('pt-BR')}</td>
            <td>{manage && <span className="card-actions">
              <FormDialog title={`Entrada de estoque · ${p.name}`} eyebrow="ESTOQUE" action={restockProduct} submitLabel="Registrar entrada" trigger={<PackagePlus size={14}/>} triggerLabel="Entrada de estoque" triggerClassName="link-button"><input type="hidden" name="id" value={p.id}/><label>Unidades que entraram<input name="amount" type="number" min={1} step={1} required/></label></FormDialog>
              <FormDialog title="Editar produto" eyebrow="ESTOQUE" action={saveProduct} submitLabel="Salvar" trigger="Editar" triggerClassName="link-button"><ProductFields product={p}/></FormDialog>
              <ActionButton action={deleteProduct} fields={{ id: p.id }} className="link-button danger" confirmMessage={`Excluir “${p.name}”? Se ele estiver em comandas, será apenas desativado.`} title="Excluir"><Trash2 size={13}/></ActionButton>
            </span>}</td>
          </tr>; })}</tbody>
        </table></div>}
    </section>
  </>;
}
