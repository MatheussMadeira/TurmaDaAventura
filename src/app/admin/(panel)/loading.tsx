import { Box, Cols, Stack } from '@/admin/ui/layout';
import { Sk } from '@/admin/ui/controls';

/** Carregando: blocos de espera, nunca spinner. */
export default function PanelLoading() {
  return (
    <Stack aria-busy="true" aria-label="Carregando">
      <Stack $gap="var(--space-2)">
        <Sk $h="14px" $w="120px" />
        <Sk $h="34px" $w="280px" />
      </Stack>
      <Cols $n={4}>
        {[0, 1, 2, 3].map((i) => (
          <Box key={i}>
            <Sk $h="40px" $w="40px" />
            <Sk $h="40px" $w="80px" />
            <Sk $h="16px" $w="70%" />
          </Box>
        ))}
      </Cols>
      <Box>
        <Sk $h="22px" $w="200px" />
        <Sk $h="44px" />
        <Sk $h="44px" />
        <Sk $h="44px" />
      </Box>
    </Stack>
  );
}
