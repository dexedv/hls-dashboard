import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, router } from '@inertiajs/react';
import PageHeader, { Button } from '@/Components/PageHeader';

const STATUS_COLORS = { pending: 'bg-amber-100 text-amber-700', approved: 'bg-green-100 text-green-700', rejected: 'bg-red-100 text-red-700', reimbursed: 'bg-blue-100 text-blue-700' };
const STATUS_LABELS = { pending: 'Ausstehend', approved: 'Genehmigt', rejected: 'Abgelehnt', reimbursed: 'Erstattet' };

export default function ExpenseShow({ expense }) {
    return (
        <DashboardLayout title={expense.title}>
            <Head title={expense.title} />
            <PageHeader
                title={expense.title}
                subtitle={STATUS_LABELS[expense.status] || expense.status}
                actions={
                    <div className="flex gap-2">
                        {expense.status === 'pending' && (
                            <>
                                <Button variant="success" onClick={() => router.post(route('expenses.approve', expense.id))}>Genehmigen</Button>
                                <Button variant="danger" onClick={() => router.post(route('expenses.reject', expense.id))}>Ablehnen</Button>
                            </>
                        )}
                        <Link href={route('expenses.edit', expense.id)}><Button variant="secondary">Bearbeiten</Button></Link>
                    </div>
                }
            />

            <div className="max-w-2xl space-y-4">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm">
                        <div>
                            <p className="text-gray-500">Betrag</p>
                            <p className="text-2xl font-bold text-gray-900 mt-0.5">
                                {Number(expense.amount).toLocaleString('de-DE', { minimumFractionDigits: 2 })} {expense.currency}
                            </p>
                        </div>
                        <div>
                            <p className="text-gray-500">Status</p>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-0.5 ${STATUS_COLORS[expense.status] || 'bg-gray-100 text-gray-500'}`}>
                                {STATUS_LABELS[expense.status] || expense.status}
                            </span>
                        </div>
                        <div>
                            <p className="text-gray-500">Datum</p>
                            <p className="font-medium mt-0.5">{expense.expense_date ? new Date(expense.expense_date).toLocaleDateString('de-DE') : '—'}</p>
                        </div>
                        <div>
                            <p className="text-gray-500">Kategorie</p>
                            <p className="font-medium mt-0.5">{expense.category || '—'}</p>
                        </div>
                        <div>
                            <p className="text-gray-500">Erstellt von</p>
                            <p className="font-medium mt-0.5">{expense.creator?.name || '—'}</p>
                        </div>
                        {expense.approver && (
                            <div>
                                <p className="text-gray-500">Genehmigt von</p>
                                <p className="font-medium mt-0.5">{expense.approver.name}</p>
                            </div>
                        )}
                        {expense.project && (
                            <div>
                                <p className="text-gray-500">Projekt</p>
                                <Link href={route('projects.show', expense.project.id)} className="font-medium text-primary-600 hover:underline mt-0.5 block">{expense.project.name}</Link>
                            </div>
                        )}
                        {expense.customer && (
                            <div>
                                <p className="text-gray-500">Kunde</p>
                                <Link href={route('customers.show', expense.customer.id)} className="font-medium text-primary-600 hover:underline mt-0.5 block">{expense.customer.name}</Link>
                            </div>
                        )}
                    </div>

                    {expense.description && (
                        <div className="mt-4 pt-4 border-t border-gray-100">
                            <p className="text-sm text-gray-500 mb-1">Notizen</p>
                            <p className="text-sm text-gray-700 whitespace-pre-wrap">{expense.description}</p>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
