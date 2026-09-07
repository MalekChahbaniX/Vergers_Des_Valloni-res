import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Pressable, FlatList } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, radii, spacing } from '../outils/Theme';

export interface SelectOption {
  label: string;
  value: string;
  disabled?: boolean;
  /** small helper text under the label, e.g. "6/8 places" */
  helper?: string;
}

interface SelectFieldProps {
  label: string;
  placeholder?: string;
  value: string | null;
  options: SelectOption[];
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  emptyMessage?: string;
}

/**
 * Bottom-sheet style picker (rather than the native <Picker>) so touch
 * targets stay large — meant to be usable with gloves on, one-handed.
 */
const SelectField: React.FC<SelectFieldProps> = ({
  label,
  placeholder = 'Sélectionner…',
  value,
  options,
  onChange,
  error,
  required,
  disabled,
  emptyMessage = 'Aucune option disponible',
}) => {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);

  return (
    <View style={styles.group}>
      <Text style={styles.label}>
        {label}
        {required ? <Text style={styles.required}> *</Text> : null}
      </Text>
      <TouchableOpacity
        style={[styles.field, !!error && styles.fieldError, disabled && styles.fieldDisabled]}
        onPress={() => !disabled && setOpen(true)}
        activeOpacity={0.8}
        disabled={disabled}
        accessibilityRole="button"
      >
        <Text style={[styles.fieldText, !selected && styles.placeholderText]} numberOfLines={1}>
          {selected ? selected.label : placeholder}
        </Text>
        <MaterialCommunityIcons name="chevron-down" size={20} color={colors.textMuted} />
      </TouchableOpacity>
      {error ? <Text style={styles.fieldErrorText}>{error}</Text> : null}

      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.overlay} onPress={() => setOpen(false)}>
          <Pressable style={styles.sheet} onPress={() => {}}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>{label}</Text>
              <TouchableOpacity onPress={() => setOpen(false)} accessibilityLabel="Fermer">
                <MaterialCommunityIcons name="close" size={22} color={colors.textMuted} />
              </TouchableOpacity>
            </View>
            {options.length === 0 ? (
              <Text style={styles.emptyText}>{emptyMessage}</Text>
            ) : (
              <FlatList
                data={options}
                keyExtractor={(o) => o.value}
                style={styles.list}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.option,
                      item.value === value && styles.optionSelected,
                      item.disabled && styles.optionDisabled,
                    ]}
                    disabled={item.disabled}
                    onPress={() => {
                      onChange(item.value);
                      setOpen(false);
                    }}
                  >
                    <View style={styles.optionTextWrap}>
                      <Text style={[styles.optionText, item.disabled && styles.optionTextDisabled]}>
                        {item.label}
                      </Text>
                      {item.helper ? <Text style={styles.optionHelper}>{item.helper}</Text> : null}
                    </View>
                    {item.value === value && (
                      <MaterialCommunityIcons name="check" size={20} color={colors.accent} />
                    )}
                    {item.disabled && (
                      <MaterialCommunityIcons name="lock-outline" size={18} color={colors.textMuted} />
                    )}
                  </TouchableOpacity>
                )}
              />
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  group: { marginBottom: spacing.lg },
  label: { fontSize: 13, fontWeight: '600', color: colors.textMuted, marginBottom: spacing.sm },
  required: { color: colors.accentError },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md + 2,
    minHeight: 52,
  },
  fieldError: { borderColor: colors.accentError },
  fieldDisabled: { opacity: 0.5 },
  fieldText: { fontSize: 15, color: colors.textPrimary, flex: 1, marginRight: spacing.sm },
  placeholderText: { color: colors.textMuted },
  fieldErrorText: { color: colors.accentError, fontSize: 12, marginTop: 6 },

  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: colors.card,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    maxHeight: '70%',
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginBottom: spacing.sm,
  },
  sheetTitle: { fontSize: 17, fontWeight: '800', color: colors.textPrimary },
  list: { paddingHorizontal: spacing.md },
  emptyText: {
    color: colors.textMuted,
    textAlign: 'center',
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.xl,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md + 2,
    paddingHorizontal: spacing.md,
    borderRadius: radii.md,
    minHeight: 52,
  },
  optionSelected: { backgroundColor: colors.accent + '15' },
  optionDisabled: { opacity: 0.4 },
  optionTextWrap: { flex: 1 },
  optionText: { fontSize: 15, color: colors.textPrimary, fontWeight: '600' },
  optionTextDisabled: { color: colors.textMuted },
  optionHelper: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
});

export default SelectField;