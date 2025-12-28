import { useState, useEffect } from "react";
import { supabaseClient } from "../../utility";
import QRCode from "qrcode";
import { Button, Card, Input, Space, Typography, Alert, Spin } from "antd";
import { useGetIdentity } from "@refinedev/core";

const { Title, Text } = Typography;

export const ProfilePage = () => {
    const { data: user } = useGetIdentity();
    const [loading, setLoading] = useState(false);
    const [factorId, setFactorId] = useState<string | null>(null);
    const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
    const [totpSecret, setTotpSecret] = useState<string | null>(null);
    const [verifyCode, setVerifyCode] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [enrolledFactors, setEnrolledFactors] = useState<any[]>([]);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    useEffect(() => {
        fetchEnrolledFactors();
    }, []);

    const fetchEnrolledFactors = async () => {
        const { data, error } = await supabaseClient.auth.mfa.listFactors();
        if (error) {
            console.error("Error fetching factors:", error);
        } else {
            setEnrolledFactors(data.totp);
        }
    };

    const handleEnroll = async () => {
        setLoading(true);
        setError(null);
        setSuccessMessage(null);
        try {
            const { data, error } = await supabaseClient.auth.mfa.enroll({
                factorType: 'totp',
            });

            if (error) throw error;

            setFactorId(data.id);
            setTotpSecret(data.totp.secret);

            // Generate QR Code
            QRCode.toDataURL(data.totp.uri, (err, url) => {
                if (err) throw err;
                setQrCodeUrl(url);
            });
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async () => {
        if (!factorId) return;
        setLoading(true);
        setError(null);
        try {
            const challenge = await supabaseClient.auth.mfa.challenge({ factorId });
            if (challenge.error) throw challenge.error;

            const verify = await supabaseClient.auth.mfa.verify({
                factorId,
                challengeId: challenge.data.id,
                code: verifyCode,
            });

            if (verify.error) throw verify.error;

            setSuccessMessage("MFA enabled successfully!");
            setFactorId(null);
            setQrCodeUrl(null);
            setVerifyCode("");
            fetchEnrolledFactors();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleUnenroll = async (id: string) => {
        setLoading(true);
        try {
            const { error } = await supabaseClient.auth.mfa.unenroll({ factorId: id });
            if (error) throw error;
            setSuccessMessage("Factor removed successfully.");
            fetchEnrolledFactors();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <Card title="User Profile">
            <Space direction="vertical" style={{ width: '100%' }} size="large">
                <div>
                    <Title level={4}>Account Info</Title>
                    {/* @ts-ignore */}
                    <Text>Email: {user?.email}</Text>
                </div>

                <div>
                    <Title level={4}>Multi-Factor Authentication (MFA)</Title>
                    {error && <Alert message={error} type="error" showIcon style={{ marginBottom: 16 }} />}
                    {successMessage && <Alert message={successMessage} type="success" showIcon style={{ marginBottom: 16 }} />}

                    {enrolledFactors.length > 0 ? (
                        <div style={{ marginBottom: 16 }}>
                            <Alert message="MFA is currently enabled on your account." type="success" showIcon />
                            <div style={{ marginTop: 16 }}>
                                <Title level={5}>Enrolled Factors:</Title>
                                {enrolledFactors.map(factor => (
                                    <div key={factor.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, padding: 8, border: '1px solid #f0f0f0', borderRadius: 4 }}>
                                        <Text>TOTP ({factor.status})</Text>
                                        <Button danger size="small" onClick={() => handleUnenroll(factor.id)}>Remove</Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div style={{ marginBottom: 16 }}>
                            <Text type="secondary">Adding a second factor adds an extra layer of security to your account.</Text>
                        </div>
                    )}

                    {!factorId && (
                        <Button type="primary" onClick={handleEnroll} loading={loading}>
                            {enrolledFactors.length > 0 ? "Add Another Factor" : "Enroll MFA"}
                        </Button>
                    )}

                    {factorId && qrCodeUrl && (
                        <Card type="inner" title="Scan QR Code" style={{ marginTop: 16 }}>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
                                <img src={qrCodeUrl} alt="QR Code" />
                                <Text type="secondary">Secret: {totpSecret}</Text>
                                <Text>Scan this QR code with your authenticator app (e.g., Google Authenticator, Authy).</Text>
                                <Space>
                                    <Input
                                        placeholder="Enter 6-digit code"
                                        value={verifyCode}
                                        onChange={(e) => setVerifyCode(e.target.value)}
                                        maxLength={6}
                                        style={{ width: 150 }}
                                    />
                                    <Button type="primary" onClick={handleVerify} loading={loading}>
                                        Verify & Activate
                                    </Button>
                                </Space>
                                <Button type="text" onClick={() => { setFactorId(null); setQrCodeUrl(null); }}>Cancel</Button>
                            </div>
                        </Card>
                    )}
                </div>
            </Space>
        </Card>
    );
};
