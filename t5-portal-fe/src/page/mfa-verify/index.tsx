import { useState, useEffect } from "react";
import { supabaseClient } from "../../utility";
import { Button, Card, Input, Space, Typography, Alert } from "antd";
import { useNavigate, useLocation } from "react-router";

const { Title, Text } = Typography;

export const MfaVerifyPage = () => {
    const [loading, setLoading] = useState(false);
    const [verifyCode, setVerifyCode] = useState("");
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const location = useLocation();

    const handleVerify = async () => {
        setLoading(true);
        setError(null);
        try {
            const { data: factors, error: listError } = await supabaseClient.auth.mfa.listFactors();
            if (listError) throw listError;

            const totpFactor = factors.totp[0]; // Assuming one TOTP factor for now
            if (!totpFactor) {
                throw new Error("No MFA factor found.");
            }

            const challenge = await supabaseClient.auth.mfa.challenge({ factorId: totpFactor.id });
            if (challenge.error) throw challenge.error;

            const verify = await supabaseClient.auth.mfa.verify({
                factorId: totpFactor.id,
                challengeId: challenge.data.id,
                code: verifyCode,
            });

            if (verify.error) throw verify.error;

            // Success! Redirect to home or original destination
            navigate("/");
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f0f2f5' }}>
            <Card style={{ width: 400 }}>
                <div style={{ textAlign: 'center', marginBottom: 24 }}>
                    <Title level={3}>MFA Verification</Title>
                    <Text>Please enter the code from your authenticator app.</Text>
                </div>

                {error && <Alert message={error} type="error" showIcon style={{ marginBottom: 16 }} />}

                <Space direction="vertical" style={{ width: '100%' }}>
                    <Input
                        placeholder="Enter 6-digit code"
                        value={verifyCode}
                        onChange={(e) => setVerifyCode(e.target.value)}
                        maxLength={6}
                        size="large"
                        onPressEnter={handleVerify}
                        autoFocus
                    />
                    <Button type="primary" onClick={handleVerify} loading={loading} block size="large">
                        Verify
                    </Button>
                </Space>
            </Card>
        </div>
    );
};
