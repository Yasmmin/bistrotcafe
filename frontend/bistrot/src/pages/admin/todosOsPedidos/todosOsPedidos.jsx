import { useState, useEffect } from "react";
import axios from "axios";
import { BsChevronExpand } from "react-icons/bs";
import Sidebar from "../../../components/sidebar/sidebar";
import "./todosOsPedidos.css";


function TodosOsPedidos() {
    const [pedidos, setPedidos] = useState([]);
    const [records, setRecords] = useState([]);
    const [orderAsc, setOrderAsc] = useState(true);
    const [statusFilter, setStatusFilter] = useState('Todos');

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    };
    
    const getStatusColor = (status) => {
        switch (status.toLowerCase()) {
            case 'entregue':
            case 'retirado':
            case 'finalizado':
            case 'saindo para entrega':
                return 'status-cor-green';
            case 'recusado':
            case 'expirado':
                return 'status-cor-red';
            case 'em análise':
                return 'status-cor-yellow';
            default:
                return '';
        }
    }
    useEffect(() => {
        const fetchPedidos = async () => {
            try {
                const res = await axios.get("http://localhost:6969/pedidos");
                setPedidos(res.data);
                setRecords(res.data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchPedidos();
    }, []);

    const filterRecords = (selectedStatus) => {
        setStatusFilter(selectedStatus);

        if (selectedStatus === 'Todos') {
            setRecords(pedidos);
            return;
        }

        const filteredPedidos = pedidos.filter((pedido) => {
            const statusMatches = pedido.status_pedido.toLowerCase() === selectedStatus.toLowerCase();
            const searchTermMatches = pedido.nome_cliente.toLowerCase().includes(selectedStatus.toLowerCase()) ||
                pedido.numero_pedido.toString().toLowerCase().includes(selectedStatus.toLowerCase()) ||
                pedido.status_pedido.toString().toLowerCase().includes(selectedStatus.toLowerCase()) ||
                new Date(pedido.data).toLocaleDateString('pt-BR').toLowerCase().includes(selectedStatus.toLowerCase()) ||
                pedido.produtos.some((produto) => produto.nome.toLowerCase().includes(selectedStatus.toLowerCase()));

            return statusMatches || searchTermMatches;
        });

        setRecords(filteredPedidos);
    };

    const toggleOrder = () => {
        const orderedPedidos = [...records].sort((a, b) => {
            const dateA = new Date(a.data);
            const dateB = new Date(b.data);
            return orderAsc ? dateA - dateB : dateB - dateA;
        });
        setRecords(orderedPedidos);
        setOrderAsc(!orderAsc);
    };

    return (
        <div className="allPedidos d-flex">
            <Sidebar />
            <div className="content">
                <div className="search-bar-pedidos w-100">
                    <form className="d-flex w-100 align-items-start">
                        <div className="search-section flex-grow-1 me-2">
                            <input
                                className="form-control formulario-todos mb-3"
                                type="search"
                                placeholder="Pesquise por Nº pedido, data..."
                                style={{ height: "3rem", width: "100%" }}
                                onChange={(e) => filterRecords(e.target.value)}
                            />
                        </div>
                        <div className="status-section me-4">
                            <p className="mb-0 mt-3 ms-1 fw-bold">Status</p>
                            <select
                                className="form-select drop-pedidos"
                                value={statusFilter}
                                onChange={(e) => filterRecords(e.target.value)}
                            >
                                <option value="Em análise">Em análise</option>
                                <option value="Em processo">Em processo</option>
                                <option value="Entregue">Entregue</option>
                                <option value="Retirado">Retirado</option>
                                <option value="Expirado">Expirado</option>
                                <option value="Todos">Todos</option>
                            </select>
                        </div>
                    </form>
                </div>
                <div className="tabela-todos-pedidos me-4">
                    <div className="text-center">
                        <table className="table table-striped">
                            <thead className="thead-light">
                                <tr>
                                    <th scope="col">Nº pedido</th>
                                    <th scope="col">Cliente (Id)</th>
                                    <th scope="col">Status</th>
                                    <th scope="col">
                                        <button onClick={toggleOrder} className="btn-order">
                                            <BsChevronExpand className={orderAsc ? "rotate-up" : "rotate-down"} />
                                        </button>
                                        Data
                                    </th>
                                    <th scope="col">Produtos</th>
                                    <th scope="col">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {records.length === 0 ? (
                                    <tr>
                                        <td colSpan="6">Nenhum resultado encontrado :(</td>
                                    </tr>
                                ) : (
                                    records.map((pedido) => (
                                        <tr key={pedido.numero_pedido}>
                                            <td>{pedido.numero_pedido}</td>
                                            <td>{pedido.nome_cliente} ({pedido.id_cliente})</td>
                                            <td>
                                                <span className={`status-cor ${getStatusColor(pedido.status_pedido)}`}>
                                                    {pedido.status_pedido}
                                                </span>
                                            </td>
                                            <td>{new Date(pedido.data).toLocaleDateString('pt-BR')}</td>
                                            <td>{pedido.produtos.map((produto) => `${produto.nome} `).join(', ')}</td>
                                            <td>{formatCurrency(pedido.valor_total)}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default TodosOsPedidos;
