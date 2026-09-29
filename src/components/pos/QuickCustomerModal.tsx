import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { posService } from '../../services/posService';
import type { Customer } from '../../models/pos.types';

interface QuickCustomerModalProps {
    show: boolean;
    onClose: () => void;
    onCustomerCreated: (customer: Customer) => void;
}

export const QuickCustomerModal: React.FC<QuickCustomerModalProps> = ({
    show,
    onClose,
    onCustomerCreated,
}) => {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [sex, setSex] = useState('Unknown');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !phone.trim()) {
            setError('Please enter both name and phone number.');
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const res = await posService.createCustomer({ name: name.trim(), phone: phone.trim(), sex });
            if (res.status === 'success' && res.customer) {
                onCustomerCreated(res.customer);
                setName('');
                setPhone('');
                onClose();
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to register customer.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal show={show} onHide={onClose} centered size="sm">
            <Modal.Header closeButton className="border-0 pb-0">
                <Modal.Title className="fs-15 fw-bold">
                    <i className="bi bi-person-plus text-primary me-2"></i> New Member Registration
                </Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleSubmit}>
                <Modal.Body className="pt-2">
                    {error && <div className="alert alert-danger py-1 px-2 fs-12 mb-2">{error}</div>}
                    <Form.Group className="mb-2">
                        <Form.Label className="small fw-bold text-muted mb-1">Customer Name</Form.Label>
                        <Form.Control 
                            type="text" 
                            size="sm" 
                            placeholder="e.g. Sreyroth" 
                            value={name} 
                            onChange={(e) => setName(e.target.value)} 
                            required 
                            autoFocus
                        />
                    </Form.Group>
                    <Form.Group className="mb-2">
                        <Form.Label className="small fw-bold text-muted mb-1">Phone Number</Form.Label>
                        <Form.Control 
                            type="tel" 
                            size="sm" 
                            placeholder="e.g. 012345678" 
                            value={phone} 
                            onChange={(e) => setPhone(e.target.value)} 
                            required 
                        />
                    </Form.Group>
                    <Form.Group className="mb-2">
                        <Form.Label className="small fw-bold text-muted mb-1">Gender</Form.Label>
                        <Form.Select size="sm" value={sex} onChange={(e) => setSex(e.target.value)}>
                            <option value="Unknown">Not Specified</option>
                            <option value="Female">Female</option>
                            <option value="Male">Male</option>
                        </Form.Select>
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer className="border-0 pt-0">
                    <Button variant="outline-secondary" size="sm" onClick={onClose} disabled={loading}>
                        Cancel
                    </Button>
                    <Button variant="primary" size="sm" type="submit" disabled={loading}>
                        {loading ? 'Saving...' : 'Register'}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};
