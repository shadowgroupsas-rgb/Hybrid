import React, { useState, useEffect } from 'react';
import { Box, H2, Text, Loader, Table, TableHead, TableBody, TableRow, TableCell } from '@adminjs/design-system';
import { ApiClient } from 'adminjs';

const Dashboard = () => {
  const [data, setData] = useState({ activeEmployees: [], overtimeEmployees: [] });
  const [loading, setLoading] = useState(true);
  const api = new ApiClient();

  useEffect(() => {
    // Ideally we fetch this from a custom API endpoint we created
    // For now we will mock the data structure to show the design
    // In a real implementation, we would call api.resourceAction or a custom endpoint
    setTimeout(() => {
      setData({
        activeEmployees: [
          { name: 'Juan Perez', status: 'WORKING', city: 'Cartagena' },
          { name: 'Maria Gomez', status: 'WORKING', city: 'Bogota' },
        ],
        overtimeEmployees: [
          { name: 'Carlos Diaz', status: 'OVERTIME', hours: '2.5' },
        ],
      });
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return <Loader />;
  }

  return (
    <Box variant="grey">
      <Box variant="white" padding="xl">
        <H2>👁️ Ojo de Dios (God's Eye)</H2>
        <Text>Real-time monitoring of Copower operations.</Text>
      </Box>

      <Box flex flexDirection="row" mt="xl" gap="xl">
        {/* Active Employees Card */}
        <Box flexGrow={1} variant="white" padding="xl" boxShadow="card">
          <H2 color="primary100">Active Personnel</H2>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Location</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.activeEmployees.map((emp, i) => (
                <TableRow key={i}>
                  <TableCell>{emp.name}</TableCell>
                  <TableCell><span style={{color: 'green'}}>{emp.status}</span></TableCell>
                  <TableCell>{emp.city}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>

        {/* Overtime Alert Card */}
        <Box flexGrow={1} variant="white" padding="xl" boxShadow="card" style={{ borderTop: '4px solid #D32F2F' }}>
          <H2 color="accent">Overtime Alerts (Night Shift)</H2>
           <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Hours</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.overtimeEmployees.map((emp, i) => (
                <TableRow key={i}>
                  <TableCell>{emp.name}</TableCell>
                  <TableCell><span style={{color: '#D32F2F', fontWeight: 'bold'}}>{emp.status}</span></TableCell>
                  <TableCell>{emp.hours}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;
